import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import VendeurView from './vendeurView/vendeurView';

import './vendeursView.css';

export default function VendeursView({ setVal, actualUser }) {
    const [vendeurs, setVendeurs] = useState([]);
    const [selectedVendeurId, setSelectedVendeurId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newVendeur, setNewVendeur] = useState({
        nom: "",
        prenom: "",
        mail: "",
        telephone: "",
        listedepot: [],
        gains: 0,
        a_encaisser: 0,
    });

    const fetchVendeurs = async () => {
        try {
            const userDocRef = doc(db, "users", actualUser.id);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                setVendeurs(userData.vendeurs || []);
            } else {
                console.error("Utilisateur introuvable");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des vendeurs :", error);
        }
    };

    useEffect(() => {
        fetchVendeurs();
    }, [actualUser]);

    const handleCardClick = (vendeurId) => {
        setIsCreating(false);
        setSelectedVendeurId(vendeurId);
    };

    const handleNewVendeurChange = (e) => {
        const { name, value } = e.target;
        setNewVendeur(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateVendeur = async () => {
        try {
            const userDocRef = doc(db, "users", actualUser.id);
            const updatedVendeurs = [...vendeurs, newVendeur];
            await updateDoc(userDocRef, { vendeurs: updatedVendeurs });
            console.log("Nouveau vendeur ajouté");

            // Réinitialisation du formulaire
            setIsCreating(false);
            setNewVendeur({
                nom: "",
                prenom: "",
                mail: "",
                telephone: "",
                listedepot: [],
                gains: 0,
                a_encaisser: 0,
            });

            // Rafraîchir la liste des vendeurs
            setVendeurs(updatedVendeurs);
        } catch (error) {
            console.error("Erreur lors de la création du vendeur :", error);
        }
    };

    return (
        <div className='VendeursView'>
            <h1>Gestion des Vendeurs</h1>
            <button className="add-vendeur-button" onClick={() => {
                setIsCreating(true);
                setSelectedVendeurId(null);
            }} title="Ajouter un vendeur">+</button>
            <div className="vendeur-list">
                {vendeurs.map((vendeur, index) => (
                    <div
                        key={index}
                        className="vendeur-card"
                        onClick={() => handleCardClick(index)}
                    >
                        <h3>{vendeur.nom} {vendeur.prenom}</h3>
                        <p><strong>Email :</strong> {vendeur.mail}</p>
                    </div>
                ))}
            </div>
            {selectedVendeurId !== null && (
                <VendeurView vendeurId={selectedVendeurId} setSelectedVendeurId={setSelectedVendeurId} refreshVendeurs={fetchVendeurs} actualUser={actualUser} />
            )}

            {isCreating && (
                <div className="create-vendeur-form">
                    <h2>Ajouter un nouveau vendeur</h2>
                    <label>Nom :</label>
                    <input
                        type="text"
                        name="nom"
                        value={newVendeur.nom}
                        onChange={handleNewVendeurChange}
                    />
                    <label>Prénom :</label>
                    <input
                        type="text"
                        name="prenom"
                        value={newVendeur.prenom}
                        onChange={handleNewVendeurChange}
                    />
                    <label>Email :</label>
                    <input
                        type="email"
                        name="mail"
                        value={newVendeur.mail}
                        onChange={handleNewVendeurChange}
                    />
                    <label>Téléphone :</label>
                    <input
                        type="text"
                        name="telephone"
                        value={newVendeur.telephone}
                        onChange={handleNewVendeurChange}
                    />
                    <button onClick={handleCreateVendeur}>Ajouter</button>
                    <button onClick={() => setIsCreating(false)}>Annuler</button>
                </div>
            )}
        </div>
    );
}
