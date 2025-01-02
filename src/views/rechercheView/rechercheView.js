import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import './rechercheView.css';

export default function RechercheView() {
    const [jeux, setJeux] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const jeuxCollection = collection(db, 'jeux');
            const q = query(jeuxCollection, where('nom_jeu', '>=', searchTerm), where('nom_jeu', '<=', searchTerm + '\uf8ff'));
            const querySnapshot = await getDocs(q);
            const jeuxList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
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
                    {jeux.map(jeu => (
                        <div key={jeu.id} className="jeu-card">
                            <h3>{jeu.nom_jeu}</h3>
                            <p><strong>État :</strong> {jeu.etat}</p>
                            <p><strong>Valeur (€) :</strong> {jeu.valeur}</p>
                            <p><strong>Situation :</strong> {jeu.situation}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
