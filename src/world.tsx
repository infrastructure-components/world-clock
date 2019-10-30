import React, {useState} from 'react';
import styled from 'styled-components';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import countryTimezone from 'country-timezone';

const countriesUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";
const timezonesUrl = "https://raw.githubusercontent.com/frankzickert/world-clock/master/src/timezones.json";

const Map = styled(ComposableMap)`
    width: 100%;
`;

const StyledCountry = styled(Geography)`
    fill: #FFF5;
    stroke: #000;
    strokeWidth: 0.75;
    outline: none;
    fill: ${props => props.isActive ? "#4141FF66" : "#FFF5"};
    
`;

const StyledTimezone = styled(Geography)`
    pointer-events: ${props => props.isActive ? "none" : "unset"};
    fill: ${props => props.isActive ? "#FF6F6166" : "#FFF5"};
    outline: none;
    stroke: #000;
    strokeWidth: 0.75;
`;

const ToolTip = styled.div`
    position: fixed;
    background-color: #FFF;
    left: ${(props) => props.x}px;
    transform: translate(-50%, -150%);
    top: ${(props) => props.y}px;
    pointer-events: none;
`;

const dateToString = d => d.toISOString().slice(0,19).replace(/T/g," ");

const getLocalTime = offset => {
    const d = new Date();
    return new Date(Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes()+parseFloat(offset)*60
    ));
};

const World = () => {

    const [{activeCountry, countryData, countryZones}, setCountry] = useState({
        country: undefined,
        countryData: undefined,
        countryZones: undefined
    });

    const [{activeTimezone, offset}, setTimezone] = useState({activeTimezone: undefined, offset: undefined});
    const [{x,y, toolTip}, setToolTip] = useState({x: undefined, y: undefined, toolTip: undefined});

    const selectCountry = (country) => {
        if (activeCountry == country.rsmKey) {
            return;
        }

        setCountry({
            activeCountry: country.rsmKey,
            countryData: country.properties,
            countryZones: countryTimezone.getTimezonesWithCountryCode(
                country.properties.ISO_A2.length == 2 ? country.properties.ISO_A2 : country.properties.FIPS_10_
            )
        });
    };

    const selectTimezone = (timezone) => {
        if (timezone.rsmKey == activeTimezone) return;
        setTimezone({activeTimezone: timezone.rsmKey, offset: timezone.properties.name});
    };

    return <div>
        <Map width={980} height={470}>
            <Geographies geography={countriesUrl}>
                {( {geographies}) =>
                    geographies.map(
                        (country, i) => (
                            <StyledCountry
                                key={country.rsmKey}
                                geography={country}
                                onMouseMove={event => selectCountry(country)}
                                isActive={activeCountry == country.rsmKey}
                                onClick={event =>{
                                    const clientX = event.clientX;
                                    const clientY = event.clientY;

                                    const params = {
                                        method: "GET",
                                        headers: {
                                            "Accept": "application/json",
                                            "Accept-Charset": "utf-8"
                                        }
                                    };

                                    fetch(
                                        "http://worldtimeapi.org/api/timezone/" + countryZones[0],
                                        params
                                    ).then(result => {
                                        return result.json();
                                    }).then(result => {

                                        const difference = parseInt(offset * 3600) - parseInt(result.raw_offset);
                                        const parsedDate = new Date(Date.UTC(
                                            result.datetime.slice(0,4),
                                            result.datetime.slice(5,7),
                                            result.datetime.slice(8,10),
                                            result.datetime.slice(11,13),
                                            result.datetime.slice(14,16),
                                            parseInt(result.datetime.slice(17,19))+difference
                                        ));

                                        setToolTip({
                                            x: clientX,
                                            y: clientY,
                                            toolTip: dateToString(parsedDate)
                                        })

                                    }).catch(error => {
                                        console.error("post-error: ", error);
                                    });
                                }}
                            />
                        )
                    )
                }
            </Geographies>

            <Geographies geography={timezonesUrl}>
                {( {geographies}) => geographies
                    .map((timezone, i) => (
                        <StyledTimezone
                            key={timezone.rsmKey}
                            geography={timezone}
                            onClick={event => setToolTip({
                                x: event.clientX,
                                y: event.clientY,
                                toolTip: dateToString(getLocalTime(timezone.properties.name))
                            })}
                            isActive={activeTimezone == timezone.rsmKey}
                            onMouseMove={event => selectTimezone(timezone)}
                        />
                    ))
                }
            </Geographies>

        </Map>
        {
            toolTip && <ToolTip x={x} y={y}>{toolTip}</ToolTip>
        }
    </div>
};

export default World;