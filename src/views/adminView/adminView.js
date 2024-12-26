import React, { useState, useEffect } from "react"
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

import './adminView.css';

export default function AdminView({setVal, actualUser}){

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
            const fetchUsers = async () => {
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
            fetchUsers();
        }, []);

    
    return(
        <div className='adminView'>
            <h1>Administration</h1>

            
        </div>
    );
}