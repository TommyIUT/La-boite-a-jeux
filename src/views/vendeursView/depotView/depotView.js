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

        fetchSessionEnCours();
        fetchDepots();
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

                setIsCreatingDepot(false);
                setNewDepot({
                    nom_jeu: "",
                    etat: "",
                    valeur: "",
                    prix_ttc: null,
                    situation: "stock",
                    date_vente: null,
                });
                setDepots([...depots, newDepot]);
            } else {
                console.error("Utilisateur introuvable");
            }
        } catch (error) {
            console.error("Erreur lors de la création du dépôt :", error);
        }
    };

    const handleRembourseDepot = async (index) => {
        try {
            const userDocRef = doc(db, "users", actualUser.id);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                const selectedVendeur = userData.vendeurs[vendeurId];
                const depot = selectedVendeur.listedepot[index];
    
                if (depot.situation !== "vendu") {
                    console.error("Le dépôt n'est pas vendu, remboursement impossible.");
                    return;
                }
    
                // Mise à jour de la situation du dépôt
                depot.situation = "remboursé";
    
                // Calcul des nouveaux montants
                const valeurDepot = parseFloat(depot.valeur);
                selectedVendeur.gains = (selectedVendeur.gains || 0) + valeurDepot;
                selectedVendeur.a_encaisser = (selectedVendeur.a_encaisser || 0) - valeurDepot;
    
                // Mise à jour dans la base de données
                await updateDoc(userDocRef, {
                    vendeurs: userData.vendeurs
                });
    
                console.log("Dépôt remboursé :", depot);
    
                // Mise à jour de l'état local
                setDepots([...selectedVendeur.listedepot]);
            } else {
                console.error("Utilisateur introuvable");
            }
        } catch (error) {
            console.error("Erreur lors du remboursement du dépôt :", error);
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

                if (!sessionEnCours) {
                    alert("Aucune session en cours. Impossible de mettre en vente.");
                    return;
                }

                const frais_depot = sessionEnCours.frais_depot || 0;
                const commissions = sessionEnCours.t_commission || 0;
                const prix_ttc = parseFloat(depot.valeur) + (parseFloat(depot.valeur) * (frais_depot / 100)) + (parseFloat(depot.valeur) * (commissions / 100));

                depot.prix_ttc = prix_ttc;
                depot.situation = "vente";
                depot.date_vente = new Date().toISOString();

                userData.a_encaisser = (userData.a_encaisser || 0) + parseFloat(frais_depot / 100) * parseFloat(depot.valeur);
                sessionEnCours.commissions = (sessionEnCours.commissions || 0) + parseFloat(commissions / 100) * parseFloat(depot.valeur);

                await updateDoc(userDocRef, {
                    vendeurs: userData.vendeurs,
                    a_encaisser: userData.a_encaisser
                });

                const sessionDocRef = doc(db, "session", sessionEnCours.id);
                await updateDoc(sessionDocRef, {
                    commissions: sessionEnCours.commissions
                });

                console.log("Dépôt mis en vente :", depot);

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
                        {depot.situation === "vendu" && (
                            <button onClick={() => handleRembourseDepot(index)} className="btn refund">Rembourser</button>
                        )}
                        {depot.situation === "stock" && (
                            <>
                                <button onClick={() => handleSellDepot(index)} className="btn sell">Mettre en vente</button>
                                <button onClick={() => handleDeleteDepot(index)} className="btn delete">Supprimer</button>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={() => setIsCreatingDepot(true)} className="btn create">Créer dépôt</button>
            {isCreatingDepot && (
                <div className="create-depot-form">
                    <h2>Créer un nouveau dépôt</h2>
                    <label>Nom du jeu :</label>
                    <input type="text" name="nom_jeu" value={newDepot.nom_jeu} onChange={handleNewDepotChange} />
                    <label>État :</label>
                    <input type="text" name="etat" value={newDepot.etat} onChange={handleNewDepotChange} />
                    <label>Valeur (€) :</label>
                    <input type="text" name="valeur" value={newDepot.valeur} onChange={handleNewDepotChange} />
                    <button onClick={handleCreateDepot}>Ajouter</button>
                    <button onClick={() => setIsCreatingDepot(false)}>Annuler</button>
                </div>
            )}
            <button onClick={() => setIsManagingDepots(false)} className="btn close">Fermer</button>
        </div>
    );
}
