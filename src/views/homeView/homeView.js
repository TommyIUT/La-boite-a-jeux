import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, getDoc, getCountFromServer } from 'firebase/firestore';
import { db, auth } from '../../firebase';

import InfoView from '../infoView/infoView';
import ProfileView from '../profileView/profileView';
import AdminView from '../adminView/adminView';
import SessionsView from '../sessionsView/sessionsView';

import NavBar from '../../components/navBar/navBar';

import './homeView.css';

export default function HomeView(props) {
    const [val, setVal] = useState(0);
    const [users, setUsers] = useState([]);
    const [vendeurs, setVendeurs] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [depots, setDepots] = useState([]);
    const [countUsers, setCountUsers] = useState(0);
    const [actualUser, setActualUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const fetchUsersData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const listUsers = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsers(listUsers);
            } catch (error) {
                console.error("Error fetching users data:", error);
            }
        };
        fetchUsersData();
    }, []);

    useEffect(() => {
        const fetchDepotData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "depot"));
                const listDepots = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setDepots(listDepots);
            } catch (error) {
                console.error("Error fetching depots data:", error);
            }
        };
        fetchDepotData();
    }, []);

    

    useEffect(() => {
        const fetchVendeursData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "vendeurs"));
                const listVendeurs = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setVendeurs(listVendeurs);
            } catch (error) {
                console.error("Error fetching customer data:", error);
            }
        };
        fetchVendeursData();
    }, []);

    useEffect(() => {
        const getUserData = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setActualUser({ id: docSnap.id, ...docSnap.data() });
                    } else {
                        console.error("Aucun document trouvé pour cet UID !");
                    }
                } catch (err) {
                    console.error("Erreur lors de la récupération des données utilisateur :", err);
                }
            } else {
                setActualUser(null);
            }
            setLoadingUser(false);
        });

        return () => getUserData();
    }, []);


    useEffect(() => {
        const fetchUsersCount = async () => {
            try {
                const coll = collection(db, "users");
                const snapshot = await getCountFromServer(coll);
                setCountUsers(snapshot.data().count);
            } catch (error) {
                console.error("Erreur lors de la récupération du nombre d'utilisateurs :", error);
            }
        };
        fetchUsersCount();
    }, []);

    const renderView = () => {
        if (loadingUser) {
            return <p>Chargement des données...</p>;
        }

        if (!actualUser) {
            return <p>Aucun utilisateur authentifié.</p>;
        }

        switch (val) {
            case 0:
                return <InfoView ></InfoView>
            case 1:
                return <SessionsView></SessionsView>
            case 2:
                return <AdminView setVal={setVal} actualUser={actualUser}></AdminView>
            case 4:
            case 5:
                return <ProfileView setVal={setVal} actualUser={actualUser} setActualUser={setActualUser} />;
            case 6:
                return <AdminView setVal={setVal} />;
            default:
                return (
                    <InfoView 
                        countUsers={countUsers} 
                        users={users} 
                    />
                );
        }
    };

    return (
        <div className="HomeView">
            <div>
                <NavBar actualUser={actualUser} setVal={setVal} />
            </div>
            <div className="renderView">
                {renderView()}
            </div>
        </div>
    );
}
