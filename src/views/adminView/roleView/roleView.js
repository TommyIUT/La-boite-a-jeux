import React, { useEffect, useState } from 'react';
import { db, auth } from '../../../firebase';
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

import './roleView.css';

export default function RoleView(props){

    const users = props.listUser;
    const setListUser = props.setListUser;
    const [currentUserRole, setCurrentUserRole] = useState('');

    useEffect(() => {
        // console.log("users : ",users);
        // Vérifier le rôle de l'utilisateur actuel
        const checkUserRole = async () => {
            try {
                const currentUserDocRef = doc(db, 'users', auth.currentUser.uid);
                const currentUserDocSnapshot = await getDoc(currentUserDocRef);
                setCurrentUserRole(currentUserDocSnapshot.data().role);
                // console.log('Role de l\'utilisateur actuel :', currentUserRole);
            } catch (error) {
                console.error('Erreur lors de la vérification du rôle de l\'utilisateur actuel :', error);
            }
        };
        checkUserRole();
    }, [users, currentUserRole]);

    const changeRole = async (userId, newRole) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            // Mettre à jour uniquement le rôle de l'utilisateur spécifique
            await setDoc(userDocRef, { role: newRole }, { merge: true });
            // Vous pouvez également mettre à jour localement votre state si nécessaire
            setListUser(prevUsers => {
                return prevUsers.map(user => {
                    if (user.id === userId) {
                        return { ...user, data: { ...user.data, role: newRole } };
                    }
                    return user;
                });
            });
        } catch (error) {
            console.log(error);
        }
    }

    const deleteUserById = async (userId) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            await deleteDoc(userDocRef);
            setListUser(prevUsers => prevUsers.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user in dataBase:', error);
        }
    }


    return(
        <div className='roleView'>
            <div className='listUsers'>
                {users
                    .filter(user => user.data.role !== 'superAdmin' || currentUserRole === 'superAdmin')
                    .map(user => (
                    <div key={user.id} className='userInfo'>
                        <div className='textInfo'>
                            <p>{user.data.prenom} {user.data.nom}</p>
                            <p>{user.data.email}</p>
                            <p>Role : {user.data.role} </p>
                        </div>
                        {user.data.role === 'benevole' ?
                            <div className='betweenBtn'>
                                <button className='btn' onClick={() => changeRole(user.id, 'admin')}>Passer admin </button>
                                <button className='btn' onClick={() => deleteUserById(user.id)}>Supprimer cet utilisateur</button>
                            </div>
                            :
                            <div>
                                {currentUserRole === 'superAdmin' ?
                                    <div className='betweenBtn'>  
                                        <button className='btn' onClick={() => changeRole(user.id, 'benevole')}>Passer bénévole </button>
                                        <button className='btn' onClick={() => deleteUserById(user.id)}>Supprimer cet utilisateur</button>
                                    </div>
                                    :
                                    <div>  
                                        <button className='btn' onClick={() => changeRole(user.id, 'benevole')}>Passer bénévole </button>
                                    </div>
                                }
                                </div>
                        }         
                    </div>
                ))}
            </div>
        </div>
    );
}