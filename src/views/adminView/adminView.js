import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import './adminView.css';

export default function AdminView({ setVal, actualUser }) {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Récupération des utilisateurs
                const usersSnapshot = await getDocs(collection(db, "users"));
                const usersList = usersSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    data: doc.data(),
                }));
                // Filtrer les utilisateurs pour exclure l'utilisateur actuel
                const filteredUsers = usersList.filter(user => user.id !== actualUser.id);
                setUsers(filteredUsers);
                // Initialiser les rôles avec les valeurs actuelles
                const initialRoles = {};
                filteredUsers.forEach(user => {
                    initialRoles[user.id] = user.data.type || '';
                });
                setRoles(initialRoles);
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [actualUser]);

    const handleDeleteUser = async (userId) => {
        const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, "users", userId));
                setUsers(users.filter(user => user.id !== userId));
                alert("Utilisateur supprimé avec succès !");
            } catch (error) {
                console.error("Erreur lors de la suppression de l'utilisateur :", error);
                alert("Erreur lors de la suppression de l'utilisateur.");
            }
        }
    };

    const handleRoleChange = async(userId, role) => {
        const confirmSave = window.confirm("Êtes-vous sûr de vouloir sauvegarder ce rôle ?");
        setRoles(prevRoles => ({
            ...prevRoles,
            [userId]: role
        }));
        if (confirmSave) {
            try {
                await updateDoc(doc(db, "users", userId), {
                    type: role
                });
            } catch (error) {
                console.error("Erreur lors de la sauvegarde du rôle :", error);
                alert("Erreur lors de la sauvegarde du rôle.");
            }
        }
    };


    return (
        <div className='adminView'>
            <h1>Administration</h1>
            {loading ? (
                <p>Chargement des utilisateurs...</p>
            ) : (
                <div className="user-list">
                    {users.map(user => (
                        <div key={user.id} className="user">
                            <div className="user-info">
                                {user.data.nom} ({user.data.prenom})
                            </div>
                            <div className="user-actions">
                                <p>Rôle : </p>
                                <Select
                                    value={roles[user.id]}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    displayEmpty
                                    inputProps={{ 'aria-label': 'Sélectionner un rôle' }}
                                    sx={{width:'10vw',
                                        borderColor:'#eb6534',
                                    }}
                                >
                                    <MenuItem value="rien">Aucun</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="gestionnaire">Gestionnaire</MenuItem>
                                    <MenuItem value="acheteur">Acheteur</MenuItem>
                                </Select>
                                <IconButton
                                    className='icon'
                                    color="primary"
                                    aria-label="Supprimer l'utilisateur"
                                    variant="outlined"
                                    onClick={() => handleDeleteUser(user.id)}
                                    sx={{
                                        position: 'relative',
                                        color: 'rgb(235, 101, 52)',
                                        '&:hover': { color: 'black' },
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
