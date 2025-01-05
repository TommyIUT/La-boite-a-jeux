import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './rechercheView.css';

export default function RechercheView() {
    const [jeux, setJeux] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const jeuxList = [];

            usersSnapshot.forEach((doc) => {
                const user = doc.data();
                if (user.vendeurs) {
                    user.vendeurs.forEach((vendeur) => {
                        if (vendeur.listedepot) {
                            vendeur.listedepot.forEach((depot) => {
                                if (depot.nom_jeu.toLowerCase().includes(searchTerm.toLowerCase())) {
                                    jeuxList.push({
                                        ...depot,
                                        vendeurId: vendeur.id,
                                        userId: doc.id
                                    });
                                }
                            });
                        }
                    });
                }
            });

            setJeux(jeuxList);
        } catch (error) {
            console.error('Erreur lors de la recherche des jeux :', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchTerm) {
            handleSearch();
        }
    }, [searchTerm]);

    return (
        <div className="rechercheView">
            <h2>Rechercher des Jeux</h2>
            <input
                type="text"
                placeholder="Rechercher par nom de jeu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch}>Rechercher</button>
            {loading ? (
                <div>Chargement...</div>
            ) : (
                <div className="jeux-list">
                    {jeux.map((jeu, index) => (
                        <div key={index} className="jeu-card">
                            <h3>{jeu.nom_jeu}</h3>
                            <p><strong>État :</strong> {jeu.etat}</p>
                            <p><strong>Prix TTC :</strong> {jeu.prix_ttc}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
