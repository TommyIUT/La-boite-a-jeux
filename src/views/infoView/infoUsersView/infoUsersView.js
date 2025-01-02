import React, { useState, useEffect } from "react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

import './infoUsersView.css';

export default function InfoUsersView(props){
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Récupération des utilisateurs
                const usersSnapshot = await getDocs(collection(db, "users"));
                const usersList = usersSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    data: doc.data(),
                }));
                setUsers(usersList);
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const usersCount = users.length;
    const gestionnairesCount = users.filter(user => user.data['type'] === 'gestionnaire').length;
    const vendeursCount = users.reduce((total, user) => total + (user.data.vendeurs ? user.data.vendeurs.length : 0), 0);

    return (
        <div className="InfoUsersView">
            {loading ? (
                <div>
                    <h2>Chargement . . .</h2>
                </div>
            ) : (
                <div>
                    <h2>Utilisateurs</h2>
                    <p>
                        <strong>Nombre d'utilisateur(s) total :</strong> {usersCount}
                    </p>
                    <p>
                        <strong>Nombre de vendeur(s) enregistrés :</strong> {vendeursCount}
                    </p>
                    <p>
                        <strong>Nombre de Gestionnaire(s) de ventes :</strong> {gestionnairesCount}
                    </p>
                </div>
            )}
        </div>
    );
}
