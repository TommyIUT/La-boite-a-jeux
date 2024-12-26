import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import InfoSessionsView from './infoSessionsView/infoSessionsView';
import InfoUsersView from './infoUsersView/infoUsersView';

import './infoView.css';

export default function InfoView(){
    
    return(
        <div className='infoView'>
            <h1>Accueil</h1>
            <Tabs className='custom-tabs'>
                <TabList className='custom-tab-list'>
                    <Tab className='custom-tab'>Session en cours</Tab>
                    <Tab className='custom-tab'>Utilisateurs</Tab>
                </TabList>

                <TabPanel>
                    <InfoSessionsView />
                </TabPanel>

                <TabPanel>
                    <InfoUsersView />
                </TabPanel>
            </Tabs>            
        </div>
    );    
}