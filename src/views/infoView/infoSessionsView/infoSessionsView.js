import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import './infoSessionsView.css';

export default function InfoSessionsView() {
    const [currentSession, setCurrentSession] = useState(null);
    const [error, setError] = useState('');
    const [jeuxEnVente, setJeuxEnVente] = useState(0);

    useEffect(() => {
        const fetchCurrentSession = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "session"));
                const now = Date.now() / 1000; // Timestamp actuel en secondes
                let activeSession = null;

                querySnapshot.forEach((doc) => {
                    const session = { id: doc.id, ...doc.data() };
                    const { debut, fin } = session;

                    if (debut.seconds <= now && fin.seconds >= now) {
                        activeSession = session; // Session en cours trouvée
                    }
                });

                if (activeSession) {
                    setCurrentSession(activeSession);
                } else {
                    setCurrentSession(null); // Aucune session en cours
                }
            } catch (error) {
                console.error("Error fetching session data:", error);
                setError('Impossible de récupérer les données des sessions.');
            }
        };

        const fetchJeuxEnVente = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                let totalJeuxEnVente = 0;

                usersSnapshot.forEach((doc) => {
                    const user = doc.data();
                    if (user.vendeurs) {
                        user.vendeurs.forEach((vendeur) => {
                            if (vendeur.listedepot) {
                                totalJeuxEnVente += vendeur.listedepot.filter(depot => depot.situation === "vente").length;
                            }
                        });
                    }
                });

                setJeuxEnVente(totalJeuxEnVente);
            } catch (error) {
                console.error("Error fetching jeux en vente:", error);
                setError('Impossible de récupérer les jeux en vente.');
            }
        };

        fetchCurrentSession();
        fetchJeuxEnVente();
    }, []);

    return (
        <div className='infoSessionsView'>
            {error && <p className="error">{error}</p>}
            {currentSession ? (
                <div>
                    <h2>Session dépôt/vente en cours</h2>
                    <p><strong>Début :</strong> {new Date(currentSession.debut.seconds * 1000).toLocaleString()}</p>
                    <p><strong>Fin :</strong> {new Date(currentSession.fin.seconds * 1000).toLocaleString()}</p>
                    <p><strong>Pourcentage de frais de dépôt :</strong> {currentSession.frais_depot} %</p>
                    <p><strong>Taux de commission :</strong> {currentSession.t_commission} %</p>
                    <p><strong>Nombre de jeux en vente :</strong> {jeuxEnVente}</p>
                    {/* Mettre boutons pour proposer de vendre ou acheter */}
                </div>
            ) : (
                <div>
                    <h2>Aucune session en cours pour le moment</h2>
                    <h2>Veuillez contacter un administrateur</h2>
                </div>
            )}
        </div>
    );
}
