import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './commandesView.css';

export default function CommandesView({ actualUser }) {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalDepense, setTotalDepense] = useState(0);

    const fetchCommandes = async () => {
        try {
            const userDocRef = doc(db, 'users', actualUser.id);
            const userDocSnapshot = await getDoc(userDocRef);

            if (!userDocSnapshot.exists()) {
                console.error('Utilisateur introuvable');
                return;
            }

            const userData = userDocSnapshot.data();
            const commandes = userData.commandes || [];

            const commandesAvecSituation = await Promise.all(
                commandes.map(async (commande) => {
                    const gestionnaireDocRef = doc(db, 'users', commande.id_jeu);
                    const gestionnaireDocSnapshot = await getDoc(gestionnaireDocRef);

                    if (!gestionnaireDocSnapshot.exists()) {
                        console.warn(`Gestionnaire avec l'ID ${commande.id_jeu} introuvable.`);
                        return {
                            ...commande,
                            situation: 'Non trouvée',
                        };
                    }

                    const gestionnaireData = gestionnaireDocSnapshot.data();
                    const foundDepot = gestionnaireData.vendeurs
                        ?.flatMap((vendeur) => vendeur.listedepot || [])
                        .find((depot) => depot.nom_jeu === commande.nom_jeu);

                    return {
                        ...commande,
                        situation: foundDepot ? (foundDepot.situation === 'vendu' ? 'En attente de remboursement' : "remboursé") : 'Non trouvée',
                    };
                })
            );

            setCommandes(commandesAvecSituation);

            const total = commandes.reduce((sum, commande) => sum + (commande.prix_ttc || 0), 0);
            setTotalDepense(total);
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes :', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommandes();
    }, []);

    return (
        <div className="commandesView">
            <h2>Mes Commandes</h2>
            {loading ? (
                <div>Chargement...</div>
            ) : (
                <div>
                    <div className="commandes-list">
                        {commandes.map((commande, index) => (
                            <div key={index} className="commande-card">
                                <h3>{commande.nom_jeu}</h3>
                                <p><strong>État :</strong> {commande.etat}</p>
                                <p><strong>Date d'achat :</strong> {new Date(commande.date_vente).toLocaleDateString()}</p>
                                <p><strong>Prix TTC :</strong> {commande.prix_ttc}€</p>
                                <p><strong>Situation :</strong> {commande.situation}</p>
                            </div>
                        ))}
                    </div>
                    <div className="total-depense">
                        <h3>Total dépensé : {totalDepense.toFixed(2)}€</h3>
                    </div>
                </div>
            )}
        </div>
    );
}
