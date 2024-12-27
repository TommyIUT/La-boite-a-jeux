import React, { useState, useEffect } from 'react';
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

import './vendeurView.css';

export default function VendeurView({ vendeurId, setSelectedVendeurId, refreshVendeurs }) {
    const [vendeur, setVendeur] = useState(null);

    useEffect(() => {
        const fetchVendeur = async () => {
            try {
                const vendeurRef = doc(db, "vendeurs", vendeurId);
                const vendeurSnapshot = await getDoc(vendeurRef);
                if (vendeurSnapshot.exists()) {
                    const data = vendeurSnapshot.data();
                    setVendeur(data);
                } else {
                    console.error("Vendeur introuvable");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du vendeur :", error);
            }
        };

        if (vendeurId) {
            fetchVendeur();
        }
    }, [vendeurId]);

    const handleDelete = async () => {
        try {
            const confirmSave = window.confirm("Êtes-vous sûr de bien vouloir supprimer ce vendeur ?");
            const vendeurRef = doc(db, "vendeurs", vendeurId);
            if (confirmSave){
                await deleteDoc(vendeurRef);
                console.log("Vendeur supprimé !");
                setSelectedVendeurId(null);
                refreshVendeurs(); // Rafraîchir la liste des vendeurs
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
            </div>
        </div>
    );
}
