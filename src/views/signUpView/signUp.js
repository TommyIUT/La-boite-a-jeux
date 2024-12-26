import React,{ useEffect, useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { createUserWithEmailAndPassword } from 'firebase/auth';

import logotxt from '../../images/logo_titre.png';
import './signUp.css';

export default function SignUp(props){

    const [users, setUsers] = useState([])
    useEffect(() => {
        getUsers();
    },[]);

    const navigate = useNavigate();
    const handleClickLogin = () => { navigate('/login'); };
    
    const [prenom, setPrenom] = useState('');
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    // Fonction pour définir un cookie qui expire en 1 jour
    function setCookie(name, value) {
        const expires = new Date();
        expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 jour
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    const getUsers = async (e) => {
        const col = collection(db, "users");
        const snapshot = await getDocs(col);
        var listUsers = [];
        snapshot.forEach((doc) => {
            // console.log(doc.id, " => ", doc.data().prenom, doc.data().nom);
            listUsers.push([doc.data().prenom, doc.data().nom])
        });
        setUsers(listUsers);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (password === password2) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // console.log("User created : OK");
    
                const uid = userCredential.user.uid;
                // console.log("get uid : OK");
    
                const userDocRef = doc(db, 'users', uid);
                const user = {
                    prenom: (prenom),
                    nom: (nom),
                    email: (email),
                    adresse:(''),
                    tel: (''),
                    type: 'rien',
                    a_encaisser: 0,
                    gains:0,
                    vendeurs: []
                };
                // const { pw, ...localUser } = user; 
                await setDoc(userDocRef, user);
                // console.log("user stored in db: OK");
                
                setCookie('token',userCredential.user.accessToken)
                localStorage.setItem('user', JSON.stringify(user));
                // console.log("user stored in localStorage: OK");
                navigate('/');
            }
            else {
                alert("Les mots de passe ne correspondent pas");
            }
        }
        catch (error) {
            if (error.code === "auth/email-already-in-use") {
                alert("L'adresse email est déjà utilisée");
            } else if (error.code === "auth/invalid-email") {
                alert("L'adresse email n'est pas valide.");
            } else if (error.code === "auth/operation-not-allowed") {
                alert("L'opération n'est pas permise.");
            } else if (error.code === "auth/weak-password") {
                alert("Le mot de passe est trop petit.");
            }
        }
    }

    return(
        <div className='signUp'>
            <div className="left-panel">
                <img src={logotxt} alt="Logo La Boîte à Jeux" className="logo-image" />
                <div className='content'>
                    <h3>Déjà inscrit ? </h3>
                    <div className="register-button">
                        <button className="btn" onClick={handleClickLogin}>Se connecter</button>
                    </div>
                </div>
            </div>
            <div className="right-panel">
                    <h2 className="title">Inscription</h2>
                    <div className='fields'>
                        <form onSubmit={handleSubmit} className='signup-form'>
                            <div className="input-field">
                                <input type="text" placeholder="Prénom" maxLength={20} pattern="[a-zA-Z]+" required value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                            </div>
                            <div className="input-field">
                                <input type="text" placeholder="Nom" maxLength={20}  pattern="[a-zA-Z]+" required value={nom} onChange={(e) => setNom(e.target.value)} />
                            </div>
                            <div className="input-field">
                                <input type="email" placeholder="Mail" required value={email} onChange={(e) => setEmail(e.target.value)} /> {/*pattern="[a-zA-Z]+@[a-z]+\.[a-z]+" */}
                            </div>
                            <div className="input-field">
                                <input type="password" placeholder="Mot de passe" maxLength={20} required value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div className="input-field">
                                <input type="password" placeholder="Confirmer le mot de passe" maxLength={20} required value={password2} onChange={(e) => setPassword2(e.target.value)} />
                            </div>
                            
                            <div className="login-button">
                                <button type="submit" className="btn">S'inscrire</button>
                            </div>
                        </form>
                    </div>             
            </div>
        </div>
    );
}
