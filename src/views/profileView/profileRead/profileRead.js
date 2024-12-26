import React, { useEffect, useState } from 'react';
import { db, auth } from '../../../firebase';
import { getDoc, doc } from 'firebase/firestore';
import defaultpp from '../../../images/default.jpg'

import './profileRead.css';

export default function ProfileRead({ setVal, actualUser }) {
    const [userData, setUserData] = useState(actualUser || null);
    const [loading, setLoading] = useState(!actualUser); // Si `actualUser` est fourni, pas besoin de charger.

    useEffect(() => {
        // Si `actualUser` n'est pas fourni, récupérer les données depuis Firestore.
        const fetchUserData = async () => {
            if (!userData) {
                setLoading(true);
                const currentUser = auth.currentUser;
                if (currentUser) {
                    try {
                        const userDoc = doc(db, 'users', currentUser.uid);
                        const userSnap = await getDoc(userDoc);
                        if (userSnap.exists()) {
                            setUserData(userSnap.data());
                        } else {
                            console.error("Utilisateur non trouvé dans Firestore !");
                        }
                    } catch (err) {
                        console.error("Erreur lors de la récupération des données utilisateur :", err);
                    }
                } else {
                    console.error("Aucun utilisateur authentifié !");
                }
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userData]);

    // Affichage en cas de chargement ou d'erreur.
    if (loading) {
        return <p >Chargement des données de l'utilisateur...</p>;
    }

    if (!userData) {
        return <p>Erreur : Impossible de charger les données de l'utilisateur.</p>;
    }


    // Affichage principal du profil.
    return (
        <div className='profileRead'>
            <div>
                <h2 className='title'>Mon profil</h2>
                <div className='boxs'>
                    <div className='boxInfo'>
                        <h3>Coordonnées</h3>
                        <p className='info'>Prénom : {userData.prenom}</p>
                        <p className='info'>Nom : {userData.nom}</p>
                        <p className='info'>Email : {userData.email}</p>
                        <p className='info'>Adresse : {userData.adresse || 'Non renseigné'}</p>
                        <p className='info'>Téléphone : {userData.tel || 'Non renseigné'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
