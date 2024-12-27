import React, { useState, useEffect } from 'react';
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

import './sessionView.css';

export default function SessionView({ sessionId, setSelectedSessionId, refreshSessions }) {
    const [session, setSession] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const sessionRef = doc(db, "session", sessionId);
                const sessionSnapshot = await getDoc(sessionRef);
                if (sessionSnapshot.exists()) {
                    const data = sessionSnapshot.data();

                    // Conversion des timestamps en objets Date
                    const parsedSession = {
                        id: sessionSnapshot.id,
                        debut: data.debut.seconds ? new Date(data.debut.seconds * 1000) : null,
                        fin: data.fin.seconds ? new Date(data.fin.seconds * 1000) : null,
                        commissions: data.commissions,
                        frais_depot: data.frais_depot,
                        t_commission: data.t_commission,
                    };
                    setSession(parsedSession);
                } else {
                    console.error("Session introuvable");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la session :", error);
            }
        };

        if (sessionId) {
            fetchSession();
        }
    }, [sessionId]);

    const handleDelete = async () => {
        try {
            const sessionRef = doc(db, "session", sessionId);
            await deleteDoc(sessionRef);
            console.log("Session supprimée !");
            setSelectedSessionId(null);
            refreshSessions(); // Rafraîchir la liste des sessions
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    };

    if (!session) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="sessionView">
            <h2>Détails de la session</h2>
            <div className="session-details">
                <p><strong>Début :</strong> {session.debut ? session.debut.toLocaleString() : "Non défini"}</p>
                <p><strong>Fin :</strong> {session.fin ? session.fin.toLocaleString() : "Non défini"}</p>
                <p><strong>Commissions :</strong> {session.commissions} €</p>
                <p><strong>Frais de dépôt :</strong> {session.frais_depot} €</p>
                <p><strong>Taux de commission :</strong> {session.t_commission} %</p>
            </div>
            <div className="session-actions">
                <button onClick={handleDelete} className="btn delete">Supprimer</button>
            </div>
        </div>
    );
}
