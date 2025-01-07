import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, getDoc, getCountFromServer } from 'firebase/firestore';
import { db, auth } from '../../firebase';

import InfoView from '../infoView/infoView';
import ProfileView from '../profileView/profileView';
import AdminView from '../adminView/adminView';
import SessionsView from '../sessionsView/sessionsView';
import VendeursView from '../vendeursView/vendeursView';
import RechercheView from '../rechercheView/rechercheView';
import CommandesView from '../commandesView/commandesView';
import BilanView from '../bilanView/bilanView';

import NavBar from '../../components/navBar/navBar';

import './homeView.css';

export default function HomeView(props) {
    const [val, setVal] = useState(0);
    const [actualUser, setActualUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    

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
            case 3:
                return <BilanView setVal={setVal} actualUser={actualUser}></BilanView>
            case 4:
                return <VendeursView setVal={setVal} actualUser={actualUser}></VendeursView>
            case 5:
                return <ProfileView setVal={setVal} actualUser={actualUser} setActualUser={setActualUser} />;
            case 6:
                return <RechercheView setVal={setVal} actualUser={actualUser}/>;
            case 7:
                return <CommandesView setVal={setVal} actualUser={actualUser}></CommandesView>
            default:
                return (
                    <InfoView ></InfoView>
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
