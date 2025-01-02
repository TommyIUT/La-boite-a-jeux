import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import DepotView from '../depotView/depotView';

import './vendeurView.css';

export default function VendeurView({ vendeurId, setSelectedVendeurId, refreshVendeurs, actualUser }) {
    const [vendeur, setVendeur] = useState(null);
    const [isManagingDepots, setIsManagingDepots] = useState(false);

    useEffect(() => {
        const fetchVendeur = async () => {
            try {
                const userDocRef = doc(db, "users", actualUser.id);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    const selectedVendeur = userData.vendeurs[vendeurId];
                    setVendeur(selectedVendeur);
                } else {
                    console.error("Vendeur introuvable");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du vendeur :", error);
            }
        };

        if (vendeurId !== null) {
            fetchVendeur();
        }
    }, [vendeurId, actualUser]);

    const handleDelete = async () => {
        try {
            const userDocRef = doc(db, "users", actualUser.id);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                const updatedVendeurs = userData.vendeurs.filter((_, index) => index !== vendeurId);
                await updateDoc(userDocRef, { vendeurs: updatedVendeurs });
                console.log("Vendeur supprimé !");
                setSelectedVendeurId(null);
                refreshVendeurs(); // Rafraîchir la liste des vendeurs
            } else {
                console.error("Utilisateur introuvable");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    };

    if (!vendeur) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="vendeurView">
            <h2>Détails du vendeur</h2>
            <div className="vendeur-details">
                <p><strong>Nom :</strong> {vendeur.nom}</p>
                <p><strong>Prénom :</strong> {vendeur.prenom}</p>
                <p><strong>Email :</strong> {vendeur.mail}</p>
                <p><strong>Téléphone :</strong> {vendeur.telephone}</p>
                <p><strong>Gains :</strong> {vendeur.gains} €</p>
                <p><strong>À encaisser :</strong> {vendeur.a_encaisser} €</p>
            </div>
            <div className="vendeur-actions">
                <button onClick={handleDelete} className="btn delete">Supprimer</button>
                <button onClick={() => setIsManagingDepots(true)} className="btn manage">Gérer dépôts</button>
            </div>
            {isManagingDepots && (
                <DepotView vendeurId={vendeurId} setIsManagingDepots={setIsManagingDepots} refreshVendeurs={refreshVendeurs} actualUser={actualUser} />
            )}
        </div>
    );
}
