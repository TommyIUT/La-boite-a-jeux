import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './rechercheView.css';

export default function RechercheView({ actualUser }) {
    const [jeux, setJeux] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [commandes, setCommandes] = useState([]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const jeuxList = [];
    
            usersSnapshot.forEach((userDoc) => {
                const user = userDoc.data();
                if (user.vendeurs) {
                    user.vendeurs.forEach((vendeur) => {
                        if (vendeur.listedepot) {
                            vendeur.listedepot.forEach((depot, index) => {
                                if (searchTerm.trim() === '' || depot.nom_jeu.toLowerCase().includes(searchTerm.toLowerCase())) {
                                    jeuxList.push({
                                        ...depot,
                                        docId: userDoc.id, // Identifiant du document Firebase
                                        vendeurId: vendeur.id,
                                        depotIndex: index, // Index pour localiser le dépôt
                                    });
                                }
                            });
                        }
                    });
                }
            });
    
            const filteredJeux = jeuxList.filter(
                (jeu) => jeu.situation === 'vente' && !commandes.some((commande) => commande.id_jeu === jeu.docId)
            );
            setJeux(filteredJeux);
        } catch (error) {
            console.error('Erreur lors de la recherche des jeux :', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const fetchCommandes = async () => {
            try {
                const userDocRef = doc(db, 'users', actualUser.id);
                const userDocSnapshot = await getDoc(userDocRef);
                const userData = userDocSnapshot.data();
                setCommandes(userData.commandes || []);
            } catch (error) {
                console.error('Erreur lors de la récupération des commandes :', error);
            }
        };

        fetchCommandes();
        handleSearch();
    }, [searchTerm, actualUser]);

    const handleAcheter = async (jeu) => {
        try {
            const gestionnaireDocRef = doc(db, 'users', jeu.docId);
            const gestionnaireDocSnapshot = await getDoc(gestionnaireDocRef);
    
            if (!gestionnaireDocSnapshot.exists()) {
                console.error('Gestionnaire introuvable');
                return;
            }
    
            const gestionnaireData = gestionnaireDocSnapshot.data();
            const vendeurIndex = gestionnaireData.vendeurs.findIndex((v) => v.id === jeu.vendeurId);
    
            if (vendeurIndex === -1) {
                console.error('Vendeur introuvable');
                return;
            }
    
            const vendeur = gestionnaireData.vendeurs[vendeurIndex];
            const depot = vendeur.listedepot[jeu.depotIndex];
    
            if (!depot || depot.situation !== 'vente') {
                console.error('Jeu déjà vendu ou introuvable');
                return;
            }
    
            // Mise à jour du dépôt
            depot.situation = 'vendu';
            depot.date_vente = new Date().toISOString();
            vendeur.a_encaisser = (vendeur.a_encaisser || 0) + parseFloat(depot.valeur || 0);
    
            gestionnaireData.vendeurs[vendeurIndex].listedepot[jeu.depotIndex] = depot;
            await updateDoc(gestionnaireDocRef, { vendeurs: gestionnaireData.vendeurs });
    
            const acheteurDocRef = doc(db, 'users', actualUser.id);
            const acheteurDocSnapshot = await getDoc(acheteurDocRef);
    
            if (!acheteurDocSnapshot.exists()) {
                console.error('Acheteur introuvable');
                return;
            }
    
            const acheteurData = acheteurDocSnapshot.data();
            const commandes = acheteurData.commandes || [];
    
            commandes.push({
                id_jeu: jeu.docId, // Utilisation de l'identifiant du document
                nom_jeu: depot.nom_jeu,
                prix_ttc: depot.prix_ttc,
                etat: depot.etat,
                date_vente: depot.date_vente,
            });
    
            await updateDoc(acheteurDocRef, { commandes });
            console.log(`Le jeu "${depot.nom_jeu}" a été acheté avec succès !`);
            handleSearch();
        } catch (error) {
            console.error('Erreur lors de l\'achat du jeu :', error);
        }
    };
    

    return (
        <div className="rechercheView">
            <h2>Rechercher des Jeux</h2>
            <input
                type="text"
                placeholder="Rechercher par nom de jeu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading ? (
                <div>Chargement...</div>
            ) : (
                <div className="jeux-list">
                    {jeux.map((jeu, index) => (
                        <div key={index} className="jeu-card">
                            <h3>{jeu.nom_jeu}</h3>
                            <p>
                                <strong>État :</strong> {jeu.etat}
                            </p>
                            <p>
                                <strong>Prix TTC :</strong> {jeu.prix_ttc}€
                            </p>
                            <button onClick={() => handleAcheter(jeu)} className="btn acheter">
                                Acheter
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
