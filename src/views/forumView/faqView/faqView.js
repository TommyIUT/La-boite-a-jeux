import React, { useState } from 'react';
import { collection, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore"; 
import { db } from "../../../firebase" 
import { decryptData, encryptData } from '../../../components/encryption';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import './faqView.css';

export default function FaqView(props) {
    
    const [question, setQuestion] = useState('');
    const [replyingQuestionId, setReplyingQuestionId] = useState(null);
    const [replyText, setReplyText] = useState('');

    const sendQuestion = async (e) => {
        e.preventDefault();
        const auteur = decryptData(props.actualUser.data().prenom) + " " + decryptData(props.actualUser.data().nom)
        console.log(auteur);
        try {
            const newDoc = await addDoc(collection(db, "questions"), {
                auteur: encryptData(auteur),
                estRepondue: encryptData(false),
                question: encryptData(question),
                reponse: encryptData("")
            });
            props.setQuestions(prevQuestions => [
                ...prevQuestions,
                {
                    id: newDoc.id,
                    data: {
                        auteur: auteur,
                        estRepondue: false,
                        question: question,
                        reponse: ""
                    }
                }
            ]);
        } catch (error) {
            console.log(error);
        }
        setQuestion('');
    }

    const handleReply = async (questionId) => {
        setReplyingQuestionId(questionId);
    };

    const handleSaveReply = async (questionId) => {
        try {
            const questionDocRef = doc(db, 'questions', questionId);
            if (replyText === "") {
                await updateDoc(questionDocRef, {
                    estRepondue: encryptData(false),
                    reponse: encryptData(replyText),
                });
            }
            else {
                await updateDoc(questionDocRef, {
                    estRepondue: encryptData(true),
                    reponse: encryptData(replyText),
                });
            }

            // Mise à jour de la liste locale props.questions avec la nouvelle valeur
            const updatedQuestions = props.questions.map((question) => {
                if (question.id === questionId) {
                    if (replyText === "") {
                        return {
                            ...question,
                            data: {
                                auteur: question.data.auteur,
                                question: question.data.question,
                                estRepondue: false,
                                reponse: replyText,
                            }
                        };
                    }
                    else {
                        return {
                            ...question,
                            data: {
                                auteur: question.data.auteur,
                                question: question.data.question,
                                estRepondue: true,
                                reponse: replyText,
                            }
                        }; 
                    }  
                }
                return question;
            });
            // console.log("updatedQuestions : ",updatedQuestions);
            props.setQuestions(updatedQuestions)
            
            setReplyingQuestionId(null);
            setReplyText(''); // Réinitialiser le texte de la réponse
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la réponse :', error);
        }
    };

    const handleDelete = async (questionId) => {
        try {
            // Supprimer la question de la base de données
            const questionDocRef = doc(db, 'questions', questionId);
            await deleteDoc(questionDocRef);
            // Mettre à jour props.questions en supprimant la question avec l'ID donné
            const updatedQuestions = props.questions.filter((question) => question.id !== questionId);
            props.setQuestions(updatedQuestions);
        } catch (error) {
            console.error('Erreur lors de la suppression de la question :', error);
        }
    };

    console.log(props.questions);
    console.log(props.actualUser.data().role);
    return (
        <div className='faqView'>
            <h2>FAQ</h2>
            <Tabs className='custom-tabs'>
                <TabList className='custom-tab-list'>
                    <Tab className='custom-tab'>Poser une question</Tab>
                    <Tab className='custom-tab'>Question(s) en attente</Tab>
                    <Tab className='custom-tab'>Question(s) répondue(s)</Tab>
                    {props.actualUser.data().role !== 'benevole' && (
                        <Tab className='custom-tab'>Gérer les questions</Tab>
                    )}
                </TabList>

                <TabPanel>
                    <div className='askQuestion'>
                        <form onSubmit={sendQuestion}>
                                <textarea
                                    placeholder='Votre question'
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    required
                                    maxLength={300}
                                />
                            <button type='submit'>Envoyer</button>
                        </form>
                    </div>
                </TabPanel>

                <TabPanel>
                    <div className='pending common'>
                        <div className='box'>
                            {props.questions.map((question, index) => (
                                question.data.estRepondue === false && (
                                    <div key={question.id} className='data'>
                                        <div className='aut'>
                                            <p className='first_p'>Auteur : </p>
                                            <p className='seconde_p' >{question.data.auteur}</p>
                                        </div>
                                        <div className='ques'>    
                                            <p className='first_p'>Question : </p>
                                            <p className='seconde_p'>{question.data.question}</p>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </TabPanel>

                <TabPanel>
                <div className='answered common'>
                        <div className='box'>
                            {props.questions.map((question, index) => (
                                question.data.estRepondue === true && (
                                    <div key={question.id} className='data'>
                                        <div className='aut'>
                                            <p className='first_p'>Auteur : </p>
                                            <p className='seconde_p' >{question.data.auteur}</p>
                                        </div>
                                        <div className='ques'>    
                                            <p className='first_p'>Question : </p>
                                            <p className='seconde_p'>{question.data.question}</p>
                                        </div>
                                        <div className='rep'>    
                                            <p className='first_p'>Réponse : </p>
                                            <p className='seconde_p'>{question.data.reponse}</p>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </TabPanel>

                {props.actualUser.data().role !== 'benevole' && (
                    <TabPanel>
                        <div className='answer common'>
                            <div className='box'>
                                {props.questions.map((question, index) => (
                                    <div key={question.id} className='data'>
                                        <div>
                                            <div className='aut'>
                                                <p className='first_p'>Auteur : </p>
                                                <p className='seconde_p' >{question.data.auteur}</p>
                                            </div>
                                            <div className='ques'>    
                                                <p className='first_p'>Question : </p>
                                                <p className='seconde_p'>{question.data.question}</p>
                                            </div>
                                            {question.data.estRepondue === true && (
                                                <div className='rep'>    
                                                    <p className='first_p'>Réponse : </p>
                                                    <p className='seconde_p'>{question.data.reponse}</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className='buttons'>
                                            {question.id === replyingQuestionId ? (
                                                <div className='btn'>
                                                    <textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder='Répondez à la question...'
                                                    />
                                                    <button className="saveBtn" onClick={() => handleSaveReply(question.id)}>
                                                        Enregistrer
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className='btn'>
                                                    {question.data.estRepondue === false ? 
                                                        <button className="otherBtn" onClick={() => handleReply(question.id)}>Répondre</button>
                                                        :
                                                        <button className="otherBtn" onClick={() => {handleReply(question.id); setReplyText(question.data.reponse); }}>Modifier</button>
                                                    }
                                                    <button className="deleteBtn" onClick={() => handleDelete(question.id)}>Supprimer</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabPanel>
                )}
            </Tabs>
        </div>
    );
}
