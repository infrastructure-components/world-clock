import * as React from 'react';
import "@babel/polyfill";

import {
    Environment,
    Route,
    SinglePageApp
} from "infrastructure-components";

import WithNavigation from './navigation';
import World from './world';

export default (
    <SinglePageApp
        stackName = "world-clock"
        buildPath = 'build'
        region='us-east-1'>

        <Environment name="dev" />

        <Route
            path='/'
            name='World-Clock'
            render={(props)=><WithNavigation>
                    <World />
                </WithNavigation>}
            customType={{
                left: true
            }}
        />

        <Route
            path='/other'
            name='Another page'
            render={()=><div>My Second Route</div>}
            customType={{
                left: true
            }}
        />

        <Route
            path='/right'
            name='At right'
            render={()=><WithNavigation>Positioned at the right-hand side</WithNavigation>}
            customType={{
                left: false
            }}
        />


    </SinglePageApp>);