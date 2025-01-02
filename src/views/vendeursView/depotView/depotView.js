import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

import './depotView.css';

export default function DepotView({ vendeurId, setIsManagingDepots, refreshVendeurs, actualUser }) {
    const [depots, setDepots] = useState([]);
    const [isCreatingDepot, setIsCreatingDepot] = useState(false);
    const [newDepot, setNewDepot] = useState({
        nom_jeu: "",
        etat: "",
        valeur: "",
        prix_ttc: null,
        situation: "stock",
        date_vente: null,
    });
    const [sessionEnCours, setSessionEnCours] = useState(null);

    useEffect(() => {
        const fetchDepots = async () => {
            try {
                const userDocRef = doc(db, "users", actualUser.id);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    const selectedVendeur = userData.vendeurs[vendeurId];
                    setDepots(selectedVendeur.listedepot || []);
                } else {
                    console.error("Vendeur introuvable");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des dépôts :", error);
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
                setSessionEnCours(currentSession);
            } catch (error) {
                console.error("Erreur lors de la récupération des sessions :", error);
            }
        };

        fetchDepots();
        fetchSessionEnCours();
    }, [vendeurId, actualUser]);

    const handleNewDepotChange = (e) => {
        const { name, value } = e.target;
        setNewDepot(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateDepot = async () => {
        try {
            const userDocRef = doc(db, "users", actualUser.id);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                const updatedVendeurs = userData.vendeurs.map((v, index) => {
                    if (index === vendeurId) {
                        return {
                            ...v,
                            listedepot: [...v.listedepot, newDepot]
                        };
                    }
                    return v;
                });
                await updateDoc(userDocRef, { vendeurs: updatedVendeurs });
                console.log("Nouveau dépôt ajouté");

                // Réinitialisation du formulaire
                setIsCreatingDepot(false);
                setNewDepot({
                    nom_jeu: "",
                    etat: "",
                    valeur: "",
                    prix_ttc: null,
                    situation: "stock",
                    date_vente: null,
                });

                // Rafraîchir la liste des dépôts
                setDepots([...depots, newDepot]);
            } else {
                console.error("Utilisateur introuvable");
            }
        } catch (error) {
            console.error("Erreur lors de la création du dépôt :", error);
        }
    };

    const handleSellDepot = async (index) => {
        try {
            const userDocRef = doc(db, "users", actualUser.id);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                const selectedVendeur = userData.vendeurs[vendeurId];
                const depot = selectedVendeur.listedepot[index];

                // Vérifier s'il y a une session en cours
                if (!sessionEnCours) {
                    alert("Aucune session en cours. Impossible de mettre en vente.");
                    return;
                }

                // Calculer le prix TTC
                const frais_depot = sessionEnCours.frais_depot || 0;
                const commissions = sessionEnCours.t_commission || 0;
                const prix_ttc = parseFloat(depot.valeur) + (parseFloat(depot.valeur) * (frais_depot / 100)) + (parseFloat(depot.valeur) * (commissions / 100));

                // Mettre à jour le dépôt
                depot.prix_ttc = prix_ttc;
                depot.situation = "vente";
                depot.date_vente = new Date().toISOString();

                // Mettre à jour les frais de dépôt et de commission
                userData.a_encaisser += parseFloat(frais_depot / 100) * parseFloat(depot.valeur);
                sessionEnCours.commissions += parseFloat(commissions / 100) * parseFloat(depot.valeur);

                // Mettre à jour le document utilisateur
                await updateDoc(userDocRef, {
                    vendeurs: userData.vendeurs,
                    a_encaisser: userData.a_encaisser
                });

                // Mettre à jour la session
                const sessionDocRef = doc(db, "session", sessionEnCours.id);
                await updateDoc(sessionDocRef, {
                    commissions: sessionEnCours.commissions
                });

                console.log("Dépôt mis en vente :", depot);

                // Rafraîchir la liste des dépôts
                setDepots(selectedVendeur.listedepot);
            } else {
                console.error("Utilisateur introuvable");
            }
        } catch (error) {
            console.error("Erreur lors de la mise en vente du dépôt :", error);
        }
    };

    const handleDeleteDepot = async (index) => {
        try {
            const userDocRef = doc(db, "users", actualUser.id);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                const selectedVendeur = userData.vendeurs[vendeurId];
                const updatedListedepot = selectedVendeur.listedepot.filter((_, i) => i !== index);

                // Mettre à jour le document utilisateur
                await updateDoc(userDocRef, {
                    vendeurs: userData.vendeurs.map((v, i) => i === vendeurId ? { ...v, listedepot: updatedListedepot } : v)
                });

                console.log("Dépôt supprimé :", selectedVendeur.listedepot[index]);

                // Rafraîchir la liste des dépôts
                setDepots(updatedListedepot);
            } else {
                console.error("Utilisateur introuvable");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du dépôt :", error);
        }
    };

    return (
        <div className="depotView">
            <h2>Gestion des dépôts</h2>
            <div className="depot-list">
                {depots.map((depot, index) => (
                    <div key={index} className="depot-card">
                        <h3>{depot.nom_jeu}</h3>
                        <p><strong>État :</strong> {depot.etat}</p>
                        <p><strong>Valeur (€) :</strong> {depot.valeur}</p>
                        <p><strong>Situation :</strong> {depot.situation}</p>
                        {depot.situation === "stock" && (
                            <button onClick={() => handleSellDepot(index)} className="btn sell">Mettre en vente</button>
                        )}
                        {depot.situation === "stock" && (
                            <button onClick={() => handleDeleteDepot(index)} className="btn delete">Supprimer</button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={() => setIsCreatingDepot(true)} className="btn create">Créer dépôt</button>
            {isCreatingDepot && (
                <div className="create-depot-form">
                    <h2>Créer un nouveau dépôt</h2>
                    <label>Nom du jeu :</label>
                    <input
                        type="text"
                        name="nom_jeu"
                        value={newDepot.nom_jeu}
                        onChange={handleNewDepotChange}
                    />
                    <label>État :</label>
                    <input
                        type="text"
                        name="etat"
                        value={newDepot.etat}
                        onChange={handleNewDepotChange}
                    />
                    <label>Valeur (€) :</label>
                    <input
                        type="text"
                        name="valeur"
                        value={newDepot.valeur}
                        onChange={handleNewDepotChange}
                    />
                    <button onClick={handleCreateDepot}>Ajouter</button>
                    <button onClick={() => setIsCreatingDepot(false)}>Annuler</button>
                </div>
            )}
            <button onClick={() => setIsManagingDepots(false)} className="btn close">Fermer</button>
        </div>
    );
}
