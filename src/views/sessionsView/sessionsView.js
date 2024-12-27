import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import SessionView from './sessionView/sessionView';

import './sessionsView.css';

export default function SessionsView() {
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newSession, setNewSession] = useState({
        debut: "",
        fin: "",
        commissions: 0,
        frais_depot: 0,
        t_commission: 0,
    });

    const fetchSessions = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "session"));
            const fetchedSessions = querySnapshot.docs.map(doc => {
                const data = doc.data();

                return {
                    id: doc.id,
                    debut: new Date(data.debut.seconds * 1000),
                    fin: new Date(data.fin.seconds * 1000),
                    commissions: data.commissions,
                    frais_depot: data.frais_depot,
                    t_commission: data.t_commission,
                };
            });

            const sortedSessions = fetchedSessions.sort(
                (a, b) => a.debut - b.debut
            );

            setSessions(sortedSessions);
        } catch (error) {
            console.error("Erreur lors de la récupération des sessions :", error);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleCardClick = (sessionId) => {
        setIsCreating(false);
        setSelectedSessionId(sessionId);
    };

    const handleNewSessionChange = (e) => {
        const { name, value } = e.target;
        setNewSession(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateSession = async () => {
        try {
            // Conversion explicite des valeurs 'datetime-local' en timestamps Firebase
            const debutDate = new Date(newSession.debut);
            const finDate = new Date(newSession.fin);

            if (isNaN(debutDate.getTime()) || isNaN(finDate.getTime())) {
                console.error("Dates invalides");
                return;
            }

            // Création d'objets compatibles avec Firebase pour les timestamps
            const debutTimestamp = Timestamp.fromDate(debutDate);
            const finTimestamp = Timestamp.fromDate(finDate);

            // Ajout dans Firebase
            const docRef = await addDoc(collection(db, "session"), {
                debut: debutTimestamp,
                fin: finTimestamp,
                commissions: parseFloat(newSession.commissions),
                frais_depot: parseFloat(newSession.frais_depot),
                t_commission: parseFloat(newSession.t_commission),
            });

            console.log("Nouvelle session ajoutée avec ID :", docRef.id);

            // Réinitialisation du formulaire
            setIsCreating(false);
            setNewSession({
                debut: "",
                fin: "",
                commissions: 0,
                frais_depot: 0,
                t_commission: 0,
            });

            // Rafraîchir la liste des sessions
            fetchSessions();
        } catch (error) {
            console.error("Erreur lors de la création de la session :", error);
        }
    };

    return (
        <div className='sessionsView'>
            <h1>Sessions de dépôt/vente</h1>
            <button className="add-session-button" onClick={() => {
                setIsCreating(true);
                setSelectedSessionId(null);
            }} title="Créer une session">+</button>
            <div className="session-list">
                {sessions.map(session => (
                    <div
                        key={session.id}
                        className="session-card"
                        onClick={() => handleCardClick(session.id)}
                    >
                        <h3>Session du {session.debut.toLocaleDateString()} au {session.fin.toLocaleDateString()}</h3>
                        <p><strong>Commissions : </strong>{session.commissions} €</p>
                        <p><strong>Frais de dépôt :</strong> {session.frais_depot} %</p>
                        <p><strong>Taux de commission : </strong>{session.t_commission} %</p>
                    </div>
                ))}
            </div>
            {selectedSessionId && (
                <SessionView sessionId={selectedSessionId} setSelectedSessionId={setSelectedSessionId} refreshSessions={fetchSessions} />
            )}

            {isCreating && (
                <div className="create-session-form">
                    <h2>Créer une nouvelle session</h2>
                    <label>Date de début :</label>
                    <input
                        type="datetime-local"
                        name="debut"
                        value={newSession.debut}
                        onChange={handleNewSessionChange}
                    />
                    <label>Date de fin :</label>
                    <input
                        type="datetime-local"
                        name="fin"
                        value={newSession.fin}
                        onChange={handleNewSessionChange}
                    />
                    <label>Frais de dépôt (%) :</label>
                    <input
                        type="number"
                        name="frais_depot"
                        value={newSession.frais_depot}
                        onChange={handleNewSessionChange}
                    />
                    <label>Taux de commission (%) :</label>
                    <input
                        type="number"
                        name="t_commission"
                        value={newSession.t_commission}
                        onChange={handleNewSessionChange}
                    />
                    <button onClick={handleCreateSession}>Créer</button>
                    <button onClick={() => setIsCreating(false)}>Annuler</button>
                </div>
            )}
        </div>
    );
}
