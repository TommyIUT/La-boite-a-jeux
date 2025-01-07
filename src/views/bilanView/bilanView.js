import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from '../../firebase';
import './bilanView.css';

export default function BilanView({ actualUser }) {
    const [gestionnaire, setGestionnaire] = useState(null);
    const [tauxFrais, setTauxFrais] = useState(null);
    const [selectedVendeur, setSelectedVendeur] = useState(null);

    useEffect(() => {
        const fetchGestionnaireData = async () => {
            try {
                const docRef = doc(db, 'users', actualUser.id);
                const docSnapshot = await getDoc(docRef);
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setGestionnaire(data);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données gestionnaire :', error);
            }
        };
        const fetchSessionEnCours = async () => {
            try {
                const sessionsSnapshot = await getDocs(collection(db, "session"));
                const sessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const now = new Date();
                const currentSession = sessions.find(session => {
                    const debut = new Date(session.debut.seconds * 1000);
                    const fin = new Date(session.fin.seconds * 1000);
                    return now >= debut && now <= fin;
                });
                setTauxFrais(currentSession.frais_depot);
            } catch (error) {
                console.error("Erreur lors de la récupération des sessions :", error);
            }
        };

        fetchSessionEnCours();

        fetchGestionnaireData();
    }, [actualUser]);

    const handleSelectVendeur = (vendeur) => {
        setSelectedVendeur(vendeur);
    };

    return (
        <div className="bilanView">
            <h1>Votre bilan gestionnaire</h1>
            {gestionnaire ? (
                <div className="gestionnaire-bilan">
                    <p>
                        <strong>Gains :</strong> {gestionnaire.gains || 0} €
                    </p>
                    {tauxFrais !== null && (
                        <p>
                            <strong>Taux de frais de dépôt :</strong> {tauxFrais}%
                        </p>
                    )}
                </div>
            ) : (
                <p>Chargement des données...</p>
            )}

            <h3>Liste des Vendeurs</h3>
            <div className="vendeurs-list">
                {gestionnaire?.vendeurs?.length > 0 ? (
                    gestionnaire.vendeurs.map((vendeur, index) => (
                        <div
                            key={index}
                            className="vendeur-card"
                            onClick={() => handleSelectVendeur(vendeur)}
                        >
                            <h4>{vendeur.nom} {vendeur.prenom}</h4>
                        </div>
                    ))
                ) : (
                    <p>Aucun vendeur géré actuellement.</p>
                )}
            </div>

            {selectedVendeur && (
                <div className="vendeur-details">
                    <h3>Bilan du Vendeur</h3>
                    <p>
                        <strong>Nom :</strong> {selectedVendeur.nom} {selectedVendeur.prenom}
                    </p>
                    <p>
                        <strong>Téléphone :</strong> {selectedVendeur.telephone}
                    </p>
                    <p>
                        <strong>Gains :</strong> {selectedVendeur.gains || 0} €
                    </p>
                    <p>
                        <strong>À encaisser :</strong> {selectedVendeur.a_encaisser || 0} €
                    </p>
                    <p>
                        <strong>Nombre de jeux vendus :</strong>{' '}
                        {selectedVendeur.listedepot.filter((jeu) => jeu.situation === 'vendu' || jeu.situation === 'remboursé').length}
                    </p>
                    <p>
                        <strong>Nombre total de dépôts :</strong> {selectedVendeur.listedepot.length}
                    </p>
                </div>
            )}
        </div>
    );
}
