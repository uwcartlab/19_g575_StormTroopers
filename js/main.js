// Javascripts by Meiliu, Jamp, Atlas 2019

/*eslint-env jquery*/
/*eslint-disable no-extra-semi*/
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-console*/

/* Map of GeoJSON data from line.geojson */
var curStateLayer;
var curUrbanLayer;
var selection;
var selectedLayer;

var curLineLayer;
var curPointLayer;
var curLocationLayer;
var curPointLayer2;

var curMap;

var curLocation;
var curLocationJSON;
var curHurricane;

var curYearMin;
var curYearMax;

//overwrite the alert using jQuery UI library
window.alert = function(message,type){
    $(document.createElement("div"))
        .attr({title: type, "class": "alert"})
        .html(message)
        .dialog({
        buttons: {OK: function(){$(this).dialog("close");}},
        close: function(){$(this).remove();},
        draggable: true,
        modal: true,
        resizable: false,
        width: "auto"
    });
};

//function to instantiate the Leaflet map
function createMap() {

    //create the map
    var map = L.map('mapid', {
        center: [36, -98],
        zoom: 4
    });

    // set map boundaries to restrict panning out of bounds
    var southWest = L.latLng(0, -170),
        northEast = L.latLng(80, -10);
    var bounds = L.latLngBounds(southWest, northEast);

    map.setMaxBounds(bounds);
    map.on('drag', function () {
        map.panInsideBounds(bounds, {
            animate: false
        });
    });

    curMap = map;

    // add basemap tilelayer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        minZoom: 3,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(curMap);

    //call getData function
    getData(curMap);
    createLegend(curMap);

};

//function to retrieve the data and place it on the map
function getData(map) {

    // load the states
    $.ajax("data/state_4326_map.json", {
        dataType: "json",
        success: function(data) {
            // remove current layer if exists
            if (curStateLayer) {
                map.removeLayer(curStateLayer);
            };

            // Define the geojson layer and add it to the map
            curStateLayer = L.geoJson(data, {
                style: stateStyle,
                // filter by location
                /*filter: function(feature, layer){
                    return filterStateByName(feature, layer);
                },*/
                // on each feature of states
                onEachFeature: stateOnEachFeature
            });
            map.addLayer(curStateLayer);

        }
    });

    // load the urban
    $.ajax("data/urban_4326_map.json", {
        dataType: "json",
        success: function(data) {
            // remove current layer if exists
            if (curUrbanLayer) {
                map.removeLayer(curUrbanLayer);
            };

            // Define the geojson layer and add it to the map
            curUrbanLayer = L.geoJson(data, {
                style: urbanStyle,
                // filter by location
                /*filter: function(feature, layer){
                    return filterUrbanByName(feature, layer);
                },*/
                // on each feature of states
                onEachFeature: urbanOnEachFeature
            });
            map.addLayer(curUrbanLayer);
        }
    });

};

function stateStyle(feature) {
    return {
        fillColor: '#3f8adb',
        weight: 0.5,
        opacity: 0.3,
        color: 'white', //Outline color
        fillOpacity: 0.1
    };
}

function selectedStyle(feature) {
    return {
        fillColor: '#3f8adb',
        weight: 0.5,
        opacity: 0.5,
        color: 'White', //Outline color
        fillOpacity: 0.7
    };
}

function urbanStyle(feature) {
    return {
        fillColor: 'yellow',
        weight: 0.5,
        opacity: 0.5,
        color: 'white', //Outline color
        fillOpacity: 0.5
    };
}

// for visualization we don't need to get rid of other states
/*function filterStateByName(feature, layer){
    return feature.properties.NAME == curLocation; // the selected state
}*/

var countSelectState = 0;

function stateOnEachFeature(feature, layer) {

    //popup content is now just the city name
    var popupContent = feature.properties.NAME;

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        //offset: curSelectionLayer.getBounds().getCenter(),
        closeButton: false
    });

    layer.on({
        mouseout: function () {
            this.closePopup();
        },
        click: function (e) {

            var pop = e.target.getPopup();
            pop.setLatLng(e.latlng).openOn(curMap);

            if (curLocationLayer){
                curMap.removeLayer(curLocationLayer);
            }

            countSelectState++;

            if (selection) {
                selectedLayer.resetStyle(selection);
            }
            if (selection != e.target || (selection == e.target && (countSelectState % 2 == 1))) {
                curLocation = feature.properties.NAME;
                /*zoom in*/
                /*deselect??*/
                /*coordinate with chart*/
                e.target.setStyle(selectedStyle());
                selection = e.target;
                selectedLayer = curStateLayer;

                L.DomEvent.stopPropagation(e); // stop click event from being propagated further
            }
        }
    });
}
var countSelectUrban = 0;

function urbanOnEachFeature(feature, layer) {

    //popup content is now just the city name
    var popupContent = "<b>City</b>: " + feature.properties.NAME;

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        closeButton: false
    });

    layer.on({

        mouseover: function (e) {
            var pop = e.target.getPopup();
            pop.setLatLng(e.latlng).openOn(curMap);
        },
        mouseout: function () {
            this.closePopup();
        },
        click: function (e) {

            if (curLocationLayer){
                curMap.removeLayer(curLocationLayer);
            }

            countSelectUrban++;

            if (selection) {
                selectedLayer.resetStyle(selection);
            }
            if (selection != e.target || (selection == e.target && (countSelectUrban % 2 == 1))) {
                curLocation = feature.properties.NAME;
                /*zoom in*/
                /*deselect??*/
                /*coordinate with chart*/
                e.target.setStyle(selectedStyle());
                selection = e.target;
                selectedLayer = curUrbanLayer;

                L.DomEvent.stopPropagation(e); // stop click event from being propagated further
            }
        }
    });
}


var locations = ['Alabama', 'Alaska', 'Arizona', 'Colorado', 'Connecticut', 'Florida', 'Georgia', 'Idaho', 'Indiana', 'Kansas', 'Louisiana', 'Massachusetts', 'Minnesota', 'Missouri', 'Montana', 'Nevada', 'New Jersey', 'New York', 'North Dakota', 'Oklahoma', 'Pennsylvania', 'South Carolina', 'South Dakota', 'Texas', 'Vermont', 'West Virginia', 'Puerto Rico', 'Arkansas', 'California', 'Delaware', 'District of Columbia', 'Hawaii', 'Illinois', 'Iowa', 'Kentucky', 'Maine', 'Maryland', 'Michigan', 'Mississippi', 'Nebraska', 'New Hampshire', 'New Mexico', 'North Carolina', 'Ohio', 'Oregon', 'Rhode Island', 'Tennessee', 'Utah', 'Virginia', 'Washington', 'Wisconsin', 'American Samoa', 'Guam', 'Commonwealth of the Northern Mariana Islands', 'United States Virgin Islands', 'Wyoming', 'Cleveland, OH', 'Fayetteville, NC', 'Lubbock, TX', 'Los Angeles--Long Beach--Anaheim, CA', 'Cape Coral, FL', 'Modesto, CA', 'Orlando, FL', 'Toledo, OH--MI', 'Gulfport, MS', 'New Haven, CT', 'Palm Bay--Melbourne, FL', 'Fresno, CA', 'Springfield, IL', 'Sarasota--Bradenton, FL', 'Macon, GA', 'Buffalo, NY', 'Des Moines, IA', 'South Lyon--Howell, MI', 'Springfield, MO', 'Olympia--Lacey, WA', 'Mission Viejo--Lake Forest--San Clemente, CA', 'Danbury, CT--NY', 'Tucson, AZ', 'San Jose, CA', 'Atlantic City, NJ', 'Trenton, NJ', 'McAllen, TX', 'San Francisco--Oakland, CA', 'Bakersfield, CA', 'Reading, PA', 'Fort Wayne, IN', 'Gainesville, GA', 'Urban Honolulu, HI', 'Kennewick--Pasco, WA', 'Aberdeen--Bel Air South--Bel Air North, MD', 'Spokane, WA', 'Washington, DC--VA--MD', 'Rockford, IL', 'Hagerstown, MD--WV--PA', 'Peoria, IL', 'Clarksville, TN--KY', 'Youngstown, OH--PA', 'Columbus, GA--AL', 'El Paso, TX--NM', 'Lorain--Elyria, OH', 'Omaha, NE--IA', 'York, PA', 'Greensboro, NC', 'Evansville, IN--KY', 'Boise City, ID', 'Athens-Clarke County, GA', 'Wichita, KS', 'Stockton, CA', 'Kalamazoo, MI', 'Raleigh, NC', 'Salt Lake City--West Valley City, UT', 'Minneapolis--St. Paul, MN--WI', 'Hickory, NC', 'Greenville, SC', 'Myrtle Beach--Socastee, SC--NC', 'Port Arthur, TX', 'Milwaukee, WI', 'South Bend, IN--MI', 'Ocala, FL', 'Leesburg--Eustis--Tavares, FL', 'Fort Collins, CO', 'Spring Hill, FL', 'Conroe--The Woodlands, TX', 'Indio--Cathedral City, CA', 'Murrieta--Temecula--Menifee, CA', 'San Diego, CA', 'Sacramento, CA', 'Rock Hill, SC', 'Santa Rosa, CA', 'Lafayette, LA', 'Syracuse, NY', 'Fayetteville--Springdale--Rogers, AR--MO', 'Sebastian--Vero Beach South--Florida Ridge, FL', 'Albuquerque, NM', 'Mobile, AL', 'Flint, MI', 'Ann Arbor, MI', 'Reno, NV--CA', 'Charleston, WV', 'Deltona, FL', 'Bremerton, WA', 'San GermÃ¡n--Cabo Rojo--Sabana Grande, PR', 'Tallahassee, FL', 'Kissimmee, FL', 'Denver--Aurora, CO', 'Nashua, NH--MA', 'Virginia Beach, VA', 'Barnstable Town, MA', 'Aguadilla--Isabela--San SebastiÃ¡n, PR', 'Jacksonville, FL', 'Portland, ME', 'Dallas--Fort Worth--Arlington, TX', 'Jackson, MS', 'San Juan, PR', 'Memphis, TN--MS--AR', 'Pensacola, FL--AL', 'Chicago, IL--IN', 'Harrisburg, PA', 'Palm Coast--Daytona Beach--Port Orange, FL', 'Appleton, WI', 'Tampa--St. Petersburg, FL', 'Lancaster--Palmdale, CA', 'Lake Charles, LA', 'Dayton, OH', 'Hartford, CT', 'Bridgeport--Stamford, CT--NY', 'Durham, NC', 'Kingsport, TN--VA', 'Corpus Christi, TX', 'Lakeland, FL', 'Shreveport, LA', 'Provo--Orem, UT', 'Chattanooga, TN--GA', 'Phoenix--Mesa, AZ', 'Birmingham, AL', 'Las Vegas--Henderson, NV', 'Seattle, WA', 'Louisville/Jefferson County, KY--IN', 'Albany--Schenectady, NY', 'Scranton, PA', 'Detroit, MI', 'Worcester, MA--CT', 'Providence, RI--MA', 'Grand Rapids, MI', 'Tulsa, OK', 'Green Bay, WI', 'Warner Robins, GA', 'Winter Haven, FL', 'Baltimore, MD', 'Savannah, GA', 'Victorville--Hesperia, CA', 'Winston-Salem, NC', 'Houston, TX', 'Philadelphia, PA--NJ--DE--MD', 'Charleston--North Charleston, SC', 'Cincinnati, OH--KY--IN', 'Boston, MA--NH--RI', 'Charlotte, NC--SC', 'Allentown, PA--NJ', 'Lancaster, PA', 'Johnson City, TN', 'North Port--Port Charlotte, FL', 'Miami, FL', 'Atlanta, GA', 'Portland, OR--WA', 'Spartanburg, SC', 'Knoxville, TN', 'Indianapolis, IN', 'Akron, OH', 'Springfield, MA--CT', 'Bonita Springs, FL', 'Pittsburgh, PA', 'Beaumont, TX', 'Augusta-Richmond County, GA--SC', 'Baton Rouge, LA', 'Lansing, MI', 'Nashville-Davidson, TN', 'Asheville, NC', 'Colorado Springs, CO', 'Little Rock, AR', 'Fort Walton Beach--Navarre--Wright, FL', 'Davenport, IA--IL', 'Huntsville, AL', 'New Orleans, LA', 'Riverside--San Bernardino, CA', 'Oklahoma City, OK', 'New York--Newark, NY--NJ--CT', 'Huntington, WV--KY--OH', 'Poughkeepsie--Newburgh, NY--NJ', 'Austin, TX', 'Denton--Lewisville, TX', 'Roanoke, VA', 'Muskegon, MI', 'Canton, OH', 'High Point, NC', 'Columbia, SC', 'Ogden--Layton, UT', 'St. Louis, MO--IL', 'Concord, NC', 'Concord, CA', 'San Antonio, TX', 'Norwich--New London, CT--RI', 'Columbus, OH', 'Richmond, VA', 'Rochester, NY', 'Gastonia, NC--SC', 'Round Lake Beach--McHenry--Grayslake, IL--WI', 'Portsmouth, NH--ME', 'Montgomery, AL', 'Madison, WI', 'Wilmington, NC', 'Elkhart, IN--MI', 'Panama City, FL', 'Port St. Lucie, FL', 'Kansas City, MO--KS'];

var hurricanes = ['ABLE_1950', 'BAKER_1950', 'CHARLIE_1950', 'DOG_1950', 'EASY_1950', 'FOX_1950', 'GEORGE_1950', 'HOW_1950', 'ITEM_1950', 'JIG_1950', 'KING_1950', 'LOVE_1950', 'MIKE_1950', 'ABLE_1951', 'BAKER_1951', 'CHARLIE_1951', 'DOG_1951', 'EASY_1951', 'FOX_1951', 'GEORGE_1951', 'HOW_1951', 'ITEM_1951', 'JIG_1951', 'ABLE_1952', 'BAKER_1952', 'CHARLIE_1952', 'DOG_1952', 'EASY_1952', 'FOX_1952', 'ALICE_1953', 'BARBARA_1953', 'CAROL_1953', 'DOLLY_1953', 'EDNA_1953', 'FLORENCE_1953', 'GAIL_1953', 'HAZEL_1953', 'ALICE_1954', 'BARBARA_1954', 'CAROL_1954', 'DOLLY_1954', 'EDNA_1954', 'FLORENCE_1954', 'GILDA_1954', 'HAZEL_1954', 'ALICE_1955', 'BRENDA_1955', 'CONNIE_1955', 'DIANE_1955', 'EDITH_1955', 'FLORA_1955', 'GLADYS_1955', 'IONE_1955', 'HILDA_1955', 'JANET_1955', 'KATIE_1955', 'ANNA_1956', 'BETSY_1956', 'CARLA_1956', 'DORA_1956', 'ETHEL_1956', 'FLOSSY_1956', 'GRETA_1956', 'AUDREY_1957', 'BERTHA_1957', 'CARRIE_1957', 'DEBBIE_1957', 'ESTHER_1957', 'FRIEDA_1957', 'ALMA_1958', 'BECKY_1958', 'CLEO_1958', 'DAISY_1958', 'ELLA_1958', 'FIFI_1958', 'GERDA_1958', 'HELENE_1958', 'ILSA_1958', 'JANICE_1958', 'ARLENE_1959', 'BEULAH_1959', 'CINDY_1959', 'DEBRA_1959', 'EDITH_1959', 'FLORA_1959', 'GRACIE_1959', 'HANNAH_1959', 'IRENE_1959', 'JUDITH_1959', 'ABBY_1960', 'BRENDA_1960', 'CLEO_1960', 'DONNA_1960', 'ETHEL_1960', 'FLORENCE_1960', 'ANNA_1961', 'BETSY_1961', 'CARLA_1961', 'DEBBIE_1961', 'ESTHER_1961', 'FRANCES_1961', 'GERDA_1961', 'HATTIE_1961', 'JENNY_1961', 'INGA_1961', 'ALMA_1962', 'BECKY_1962', 'CELIA_1962', 'DAISY_1962', 'ELLA_1962', 'ARLENE_1963', 'BEULAH_1963', 'CINDY_1963', 'DEBRA_1963', 'EDITH_1963', 'FLORA_1963', 'GINNY_1963', 'HELENA_1963', 'ABBY_1964', 'BRENDA_1964', 'CLEO_1964', 'DORA_1964', 'ETHEL_1964', 'FLORENCE_1964', 'GLADYS_1964', 'HILDA_1964', 'ISBELL_1964', 'ANNA_1965', 'BETSY_1965', 'CAROL_1965', 'DEBBIE_1965', 'ELENA_1965', 'ALMA_1966', 'BECKY_1966', 'CELIA_1966', 'ELLA_1966', 'DOROTHY_1966', 'FAITH_1966', 'GRETA_1966', 'HALLIE_1966', 'INEZ_1966', 'JUDITH_1966', 'LOIS_1966', 'ARLENE_1967', 'CHLOE_1967', 'BEULAH_1967', 'DORIA_1967', 'EDITH_1967', 'FERN_1967', 'GINGER_1967', 'HEIDI_1967', 'ABBY_1968', 'BRENDA_1968', 'CANDY_1968', 'DOLLY_1968', 'EDNA_1968', 'FRANCES_1968', 'GLADYS_1968', 'ANNA_1969', 'BLANCHE_1969', 'DEBBIE_1969', 'CAMILLE_1969', 'EVE_1969', 'FRANCELIA_1969', 'GERDA_1969', 'HOLLY_1969', 'INGA_1969', 'JENNY_1969', 'KARA_1969', 'LAURIE_1969', 'MARTHA_1969', 'ALMA_1970', 'BECKY_1970', 'CELIA_1970', 'DOROTHY_1970', 'ELLA_1970', 'FELICE_1970', 'GRETA_1970', 'ARLENE_1971', 'BETH_1971', 'CHLOE_1971', 'DORIA_1971', 'FERN_1971', 'EDITH_1971', 'GINGER_1971', 'HEIDI_1971', 'IRENE_1971', 'JANICE_1971', 'KRISTY_1971', 'LAURA_1971', 'ALPHA_1972', 'AGNES_1972', 'BETTY_1972', 'CARRIE_1972', 'DAWN_1972', 'CHARLIE_1972', 'DELTA_1972', 'ALICE_1973', 'ALFA_1973', 'BRENDA_1973', 'CHRISTINE_1973', 'DELIA_1973', 'ELLEN_1973', 'FRAN_1973', 'GILDA_1973', 'ALMA_1974', 'BECKY_1974', 'CARMEN_1974', 'DOLLY_1974', 'ELAINE_1974', 'FIFI_1974', 'GERTRUDE_1974', 'AMY_1975', 'BLANCHE_1975', 'CAROLINE_1975', 'DORIS_1975', 'ELOISE_1975', 'FAYE_1975', 'GLADYS_1975', 'HALLIE_1975', 'ANNA_1976', 'BELLE_1976', 'DOTTIE_1976', 'CANDICE_1976', 'EMMY_1976', 'FRANCES_1976', 'GLORIA_1976', 'HOLLY_1976', 'ANITA_1977', 'BABE_1977', 'CLARA_1977', 'DOROTHY_1977', 'EVELYN_1977', 'FRIEDA_1977', 'AMELIA_1978', 'BESS_1978', 'CORA_1978', 'DEBRA_1978', 'ELLA_1978', 'FLOSSIE_1978', 'HOPE_1978', 'GRETA_1978', 'IRMA_1978', 'JULIET_1978', 'KENDRA_1978', 'ANA_1979', 'BOB_1979', 'CLAUDETTE_1979', 'DAVID_1979', 'FREDERIC_1979', 'ELENA_1979', 'GLORIA_1979', 'HENRI_1979', 'ALLEN_1980', 'BONNIE_1980', 'CHARLEY_1980', 'GEORGES_1980', 'EARL_1980', 'DANIELLE_1980', 'FRANCES_1980', 'HERMINE_1980', 'IVAN_1980', 'JEANNE_1980', 'KARL_1980', 'ARLENE_1981', 'BRET_1981', 'CINDY_1981', 'DENNIS_1981', 'EMILY_1981', 'FLOYD_1981', 'GERT_1981', 'HARVEY_1981', 'IRENE_1981', 'JOSE_1981', 'KATRINA_1981', 'ALBERTO_1982', 'BERYL_1982', 'CHRIS_1982', 'DEBBY_1982', 'ERNESTO_1982', 'ALICIA_1983', 'BARRY_1983', 'CHANTAL_1983', 'DEAN_1983', 'ARTHUR_1984', 'BERTHA_1984', 'CESAR_1984', 'DIANA_1984', 'EDOUARD_1984', 'FRAN_1984', 'GUSTAV_1984', 'HORTENSE_1984', 'ISIDORE_1984', 'JOSEPHINE_1984', 'KLAUS_1984', 'LILI_1984', 'ANA_1985', 'BOB_1985', 'CLAUDETTE_1985', 'DANNY_1985', 'ELENA_1985', 'FABIAN_1985', 'GLORIA_1985', 'HENRI_1985', 'ISABEL_1985', 'JUAN_1985', 'KATE_1985', 'ANDREW_1986', 'BONNIE_1986', 'CHARLEY_1986', 'DANIELLE_1986', 'EARL_1986', 'FRANCES_1986', 'ARLENE_1987', 'BRET_1987', 'CINDY_1987', 'DENNIS_1987', 'EMILY_1987', 'FLOYD_1987', 'ALBERTO_1988', 'BERYL_1988', 'CHRIS_1988', 'DEBBY_1988', 'ERNESTO_1988', 'FLORENCE_1988', 'GILBERT_1988', 'HELENE_1988', 'ISAAC_1988', 'JOAN_1988', 'KEITH_1988', 'ALLISON_1989', 'BARRY_1989', 'CHANTAL_1989', 'DEAN_1989', 'ERIN_1989', 'FELIX_1989', 'GABRIELLE_1989', 'HUGO_1989', 'IRIS_1989', 'JERRY_1989', 'KAREN_1989', 'ARTHUR_1990', 'BERTHA_1990', 'CESAR_1990', 'EDOUARD_1990', 'DIANA_1990', 'FRAN_1990', 'GUSTAV_1990', 'HORTENSE_1990', 'ISIDORE_1990', 'JOSEPHINE_1990', 'KLAUS_1990', 'LILI_1990', 'MARCO_1990', 'NANA_1990', 'ANA_1991', 'BOB_1991', 'CLAUDETTE_1991', 'DANNY_1991', 'ERIKA_1991', 'FABIAN_1991', 'GRACE_1991', 'ANDREW_1992', 'BONNIE_1992', 'CHARLEY_1992', 'DANIELLE_1992', 'EARL_1992', 'FRANCES_1992', 'ARLENE_1993', 'BRET_1993', 'CINDY_1993', 'EMILY_1993', 'DENNIS_1993', 'FLOYD_1993', 'GERT_1993', 'HARVEY_1993', 'ALBERTO_1994', 'BERYL_1994', 'CHRIS_1994', 'DEBBY_1994', 'ERNESTO_1994', 'FLORENCE_1994', 'GORDON_1994', 'ALLISON_1995', 'BARRY_1995', 'CHANTAL_1995', 'DEAN_1995', 'ERIN_1995', 'FELIX_1995', 'GABRIELLE_1995', 'HUMBERTO_1995', 'IRIS_1995', 'JERRY_1995', 'KAREN_1995', 'LUIS_1995', 'MARILYN_1995', 'NOEL_1995', 'OPAL_1995', 'PABLO_1995', 'ROXANNE_1995', 'SEBASTIEN_1995', 'TANYA_1995', 'ARTHUR_1996', 'BERTHA_1996', 'CESAR_1996', 'DOLLY_1996', 'EDOUARD_1996', 'FRAN_1996', 'GUSTAV_1996', 'HORTENSE_1996', 'ISIDORE_1996', 'JOSEPHINE_1996', 'KYLE_1996', 'LILI_1996', 'MARCO_1996', 'ANA_1997', 'BILL_1997', 'CLAUDETTE_1997', 'DANNY_1997', 'ERIKA_1997', 'FABIAN_1997', 'GRACE_1997', 'ALEX_1998', 'BONNIE_1998', 'CHARLEY_1998', 'DANIELLE_1998', 'EARL_1998', 'FRANCES_1998', 'GEORGES_1998', 'HERMINE_1998', 'IVAN_1998', 'JEANNE_1998', 'KARL_1998', 'LISA_1998', 'MITCH_1998', 'NICOLE_1998', 'ARLENE_1999', 'BRET_1999', 'CINDY_1999', 'DENNIS_1999', 'EMILY_1999', 'FLOYD_1999', 'GERT_1999', 'HARVEY_1999', 'IRENE_1999', 'JOSE_1999', 'KATRINA_1999', 'LENNY_1999', 'ALBERTO_2000', 'BERYL_2000', 'CHRIS_2000', 'DEBBY_2000', 'ERNESTO_2000', 'FLORENCE_2000', 'GORDON_2000', 'HELENE_2000', 'ISAAC_2000', 'JOYCE_2000', 'KEITH_2000', 'LESLIE_2000', 'MICHAEL_2000', 'NADINE_2000', 'ALLISON_2001', 'BARRY_2001', 'CHANTAL_2001', 'DEAN_2001', 'ERIN_2001', 'FELIX_2001', 'GABRIELLE_2001', 'HUMBERTO_2001', 'IRIS_2001', 'JERRY_2001', 'KAREN_2001', 'LORENZO_2001', 'MICHELLE_2001', 'NOEL_2001', 'OLGA_2001', 'ARTHUR_2002', 'BERTHA_2002', 'CRISTOBAL_2002', 'DOLLY_2002', 'EDOUARD_2002', 'FAY_2002', 'GUSTAV_2002', 'HANNA_2002', 'ISIDORE_2002', 'JOSEPHINE_2002', 'KYLE_2002', 'LILI_2002', 'ANA_2003', 'BILL_2003', 'CLAUDETTE_2003', 'DANNY_2003', 'ERIKA_2003', 'FABIAN_2003', 'GRACE_2003', 'HENRI_2003', 'ISABEL_2003', 'JUAN_2003', 'KATE_2003', 'LARRY_2003', 'MINDY_2003', 'NICHOLAS_2003', 'ODETTE_2003', 'PETER_2003', 'ALEX_2004', 'BONNIE_2004', 'CHARLEY_2004', 'DANIELLE_2004', 'EARL_2004', 'FRANCES_2004', 'GASTON_2004', 'HERMINE_2004', 'IVAN_2004', 'JEANNE_2004', 'KARL_2004', 'LISA_2004', 'MATTHEW_2004', 'NICOLE_2004', 'OTTO_2004', 'ARLENE_2005', 'BRET_2005', 'CINDY_2005', 'DENNIS_2005', 'EMILY_2005', 'FRANKLIN_2005', 'GERT_2005', 'HARVEY_2005', 'IRENE_2005', 'TEN_2005', 'JOSE_2005', 'KATRINA_2005', 'LEE_2005', 'MARIA_2005', 'NATE_2005', 'OPHELIA_2005', 'PHILIPPE_2005', 'RITA_2005', 'NINETEEN_2005', 'STAN_2005', 'TAMMY_2005', 'TWENTY-TWO_2005', 'VINCE_2005', 'WILMA_2005', 'ALPHA_2005', 'BETA_2005', 'GAMMA_2005', 'DELTA_2005', 'EPSILON_2005', 'ZETA_2005', 'ZETA_2006', 'ALBERTO_2006', 'BERYL_2006', 'CHRIS_2006', 'DEBBY_2006', 'ERNESTO_2006', 'FLORENCE_2006', 'GORDON_2006', 'HELENE_2006', 'ISAAC_2006', 'ANDREA_2007', 'BARRY_2007', 'CHANTAL_2007', 'DEAN_2007', 'ERIN_2007', 'FELIX_2007', 'GABRIELLE_2007', 'INGRID_2007', 'HUMBERTO_2007', 'TEN_2007', 'JERRY_2007', 'KAREN_2007', 'LORENZO_2007', 'MELISSA_2007', 'FIFTEEN_2007', 'NOEL_2007', 'OLGA_2007', 'ARTHUR_2008', 'BERTHA_2008', 'CRISTOBAL_2008', 'DOLLY_2008', 'EDOUARD_2008', 'FAY_2008', 'GUSTAV_2008', 'HANNA_2008', 'IKE_2008', 'JOSEPHINE_2008', 'KYLE_2008', 'LAURA_2008', 'MARCO_2008', 'NANA_2008', 'OMAR_2008', 'SIXTEEN_2008', 'PALOMA_2008', 'ONE_2009', 'ANA_2009', 'BILL_2009', 'CLAUDETTE_2009', 'DANNY_2009', 'ERIKA_2009', 'FRED_2009', 'EIGHT_2009', 'GRACE_2009', 'HENRI_2009', 'IDA_2009', 'ALEX_2010', 'TWO_2010', 'BONNIE_2010', 'COLIN_2010', 'FIVE_2010', 'DANIELLE_2010', 'EARL_2010', 'FIONA_2010', 'GASTON_2010', 'HERMINE_2010', 'IGOR_2010', 'JULIA_2010', 'KARL_2010', 'LISA_2010', 'MATTHEW_2010', 'NICOLE_2010', 'OTTO_2010', 'PAULA_2010', 'RICHARD_2010', 'SHARY_2010', 'TOMAS_2010', 'ARLENE_2011', 'BRET_2011', 'CINDY_2011', 'DON_2011', 'EMILY_2011', 'FRANKLIN_2011', 'GERT_2011', 'HARVEY_2011', 'IRENE_2011', 'TEN_2011', 'JOSE_2011', 'KATIA_2011', 'LEE_2011', 'MARIA_2011', 'NATE_2011', 'OPHELIA_2011', 'PHILIPPE_2011', 'RINA_2011', 'SEAN_2011', 'ALBERTO_2012', 'BERYL_2012', 'CHRIS_2012', 'DEBBY_2012', 'ERNESTO_2012', 'FLORENCE_2012', 'HELENE_2012', 'GORDON_2012', 'ISAAC_2012', 'JOYCE_2012', 'KIRK_2012', 'LESLIE_2012', 'MICHAEL_2012', 'NADINE_2012', 'OSCAR_2012', 'PATTY_2012', 'RAFAEL_2012', 'SANDY_2012', 'TONY_2012', 'ANDREA_2013', 'BARRY_2013', 'CHANTAL_2013', 'DORIAN_2013', 'ERIN_2013', 'FERNAND_2013', 'GABRIELLE_2013', 'EIGHT_2013', 'HUMBERTO_2013', 'INGRID_2013', 'JERRY_2013', 'KAREN_2013', 'LORENZO_2013', 'MELISSA_2013', 'ARTHUR_2014', 'TWO_2014', 'BERTHA_2014', 'CRISTOBAL_2014', 'DOLLY_2014', 'EDOUARD_2014', 'FAY_2014', 'GONZALO_2014', 'HANNA_2014', 'ANA_2015', 'BILL_2015', 'CLAUDETTE_2015', 'DANNY_2015', 'ERIKA_2015', 'FRED_2015', 'GRACE_2015', 'HENRI_2015', 'NINE_2015', 'IDA_2015', 'JOAQUIN_2015', 'KATE_2015', 'ALEX_2016', 'BONNIE_2016', 'COLIN_2016', 'DANIELLE_2016', 'EARL_2016', 'FIONA_2016', 'GASTON_2016', 'EIGHT_2016', 'HERMINE_2016', 'IAN_2016', 'JULIA_2016', 'KARL_2016', 'LISA_2016', 'MATTHEW_2016', 'NICOLE_2016', 'OTTO_2016', 'ARLENE_2017', 'BRET_2017', 'CINDY_2017', 'DON_2017', 'EMILY_2017', 'FRANKLIN_2017', 'GERT_2017', 'HARVEY_2017', 'IRMA_2017', 'JOSE_2017', 'KATIA_2017', 'LEE_2017', 'MARIA_2017', 'NATE_2017', 'OPHELIA_2017', 'PHILIPPE_2017', 'RINA_2017', 'HIKI_1950', 'KANOA_1957', 'DELLA_1957', 'NINA_1957', 'DOT_1959', 'PATSY_1959', 'WANDA_1959', 'ANNETTE_1960', 'BONNY_1960', 'CELESTE_1960', 'DIANA_1960', 'ESTELLE_1960', 'FERNANDA_1960', 'HYACINTH_1960', 'IVA_1961', 'JOANNE_1961', 'KATHLEEN_1961', 'LIZA_1961', 'NAOMI_1961', 'ORLA_1961', 'PAULINE_1961', 'REBECCA_1961', 'SIMONE_1961', 'TARA_1961', 'VALERIE_1962', 'WILLA_1962', 'AVA_1962', 'BERNICE_1962', 'CLAUDIA_1962', 'DOREEN_1962', 'EMILY_1963', 'FLORENCE_1963', 'GLENDA_1963', 'JENKATH_1963', 'IRAH_1963', 'LILLIAN_1963', 'MONA_1963', 'NATALIE_1964', 'ODESSA_1964', 'PRUDENCE_1964', 'ROSALYN_1964', 'TILLIE_1964', 'VICTORIA_1965', 'WALLIE_1965', 'AVA_1965', 'BERNICE_1965', 'CLAUDIA_1965', 'DOREEN_1965', 'EMILY_1965', 'FLORENCE_1965', 'GLENDA_1965', 'HAZEL_1965', 'ADELE_1966', 'BLANCA_1966', 'CONNIE_1966', 'DOLORES_1966', 'EILEEN_1966', 'FRANCESCA_1966', 'GRETCHEN_1966', 'HELGA_1966', 'IONE_1966', 'JOYCE_1966', 'KIRSTEN_1966', 'LORRAINE_1966', 'MAGGIE_1966', 'AGATHA_1967', 'BRIDGET_1967', 'CARLOTTA_1967', 'DENISE_1967', 'ELEANOR_1967', 'FRANCENE_1967', 'GEORGETTE_1967', 'ILSA_1967', 'JEWEL_1967', 'KATRINA_1967', 'LILY_1967', 'SARAH_1967', 'MONICA_1967', 'NANETTE_1967', 'OLIVIA_1967', 'PRISCILLA_1967', 'RAMONA_1967', 'ANNETTE_1968', 'BONNY_1968', 'CELESTE_1968', 'DIANA_1968', 'ESTELLE_1968', 'FERNANDA_1968', 'GWEN_1968', 'HYACINTH_1968', 'IVA_1968', 'JOANNE_1968', 'KATHLEEN_1968', 'LIZA_1968', 'MADELINE_1968', 'NAOMI_1968', 'ORLA_1968', 'PAULINE_1968', 'REBECCA_1968', 'SIMONE_1968', 'TARA_1968', 'AVA_1969', 'BERNICE_1969', 'CLAUDIA_1969', 'DOREEN_1969', 'EMILY_1969', 'FLORENCE_1969', 'GLENDA_1969', 'HEATHER_1969', 'IRAH_1969', 'JENNIFER_1969', 'ADELE_1970', 'BLANCA_1970', 'CONNIE_1970', 'EILEEN_1970', 'FRANCESCA_1970', 'GRETCHEN_1970', 'HELGA_1970', 'IONE2_1970', 'IONE1_1970', 'JOYCE_1970', 'KRISTEN_1970', 'LORRAINE_1970', 'MAGGIE_1970', 'NORMA_1970', 'DOT_1970', 'ORLENE_1970', 'PATRICIA_1970', 'ROSALIE_1970', 'SELMA_1970', 'AGATHA_1971', 'BRIDGET_1971', 'CARLOTTA_1971', 'DENISE_1971', 'ELEANOR_1971', 'FRANCESCA_1971', 'GEORGETTE_1971', 'HILARY_1971', 'ILSA_1971', 'JEWEL_1971', 'KATRINA_1971', 'LILY_1971', 'MONICA_1971', 'NANETTE_1971', 'OLIVIA_1971', 'PRISCILLA_1971', 'RAMONA_1971', 'SHARON_1971', 'ANNETTE_1972', 'BONNY_1972', 'CELESTE_1972', 'DIANA_1972', 'ESTELLE_1972', 'FERNANDA_1972', 'GWEN_1972', 'HYACINTH_1972', 'IVA_1972', 'JUNE_1972', 'JOANNE_1972', 'KATHLEEN_1972', 'RUBY_1972', 'LIZA_1972', 'AVA_1973', 'BERNICE_1973', 'CLAUDIA_1973', 'DOREEN_1973', 'EMILY_1973', 'FLORENCE_1973', 'GLENDA_1973', 'HEATHER_1973', 'IRAH_1973', 'JENNIFER_1973', 'KATHERINE_1973', 'LILLIAN_1973', 'ALETTA_1974', 'BLANCA_1974', 'CONNIE_1974', 'DOLORES_1974', 'EILEEN_1974', 'FRANCESCA_1974', 'GRETCHEN_1974', 'HELGA_1974', 'IONE_1974', 'OLIVE_1974', 'JOYCE_1974', 'KIRSTEN_1974', 'LORRAINE_1974', 'MAGGIE_1974', 'NORMA_1974', 'ORLENE_1974', 'PATRICIA_1974', 'ROSALIE_1974', 'AGATHA_1975', 'BRIDGET_1975', 'CARLOTTA_1975', 'DENISE_1975', 'ELEANOR_1975', 'FRANCENE_1975', 'GEORGETTE_1975', 'HILARY_1975', 'ILSA_1975', 'JEWEL_1975', 'KATRINA_1975', 'LILY_1975', 'MONICA_1975', 'NANETTE_1975', 'OLIVIA_1975', 'PRISCILLA_1975', 'ANNETTE_1976', 'BONNY_1976', 'CELESTE_1976', 'DIANA_1976', 'ESTELLE_1976', 'FERNANDA_1976', 'GWEN_1976', 'HYACINTH_1976', 'IVA_1976', 'JOANNE_1976', 'KATHLEEN_1976', 'KATE_1976', 'LIZA_1976', 'MADELINE_1976', 'NAOMI_1976', 'AVA_1977', 'BERNICE_1977', 'CLAUDIA_1977', 'DOREEN_1977', 'EMILY_1977', 'FLORENCE_1977', 'GLENDA_1977', 'HEATHER_1977', 'ALETTA_1978', 'BUD_1978', 'CARLOTTA_1978', 'DANIEL_1978', 'EMILIA_1978', 'FICO_1978', 'GILMA_1978', 'HECTOR_1978', 'IVA_1978', 'JOHN_1978', 'KRISTY_1978', 'LANE_1978', 'MIRIAM_1978', 'NORMAN_1978', 'OLIVIA_1978', 'PAUL_1978', 'ROSA_1978', 'SUSAN_1978', 'SERGIO_1978', 'ANDRES_1979', 'BLANCA_1979', 'CARLOS_1979', 'DOLORES_1979', 'ENRIQUE_1979', 'FEFA_1979', 'GUILLERMO_1979', 'HILDA_1979', 'IGNACIO_1979', 'JIMENA_1979', 'AGATHA_1980', 'BLAS_1980', 'CELIA_1980', 'DARBY_1980', 'ESTELLE_1980', 'FRANK_1980', 'GEORGETTE_1980', 'HOWARD_1980', 'ISIS_1980', 'JAVIER_1980', 'KAY_1980', 'LESTER_1980', 'MADELINE_1980', 'NEWTON_1980', 'ADRIAN_1981', 'BEATRIZ_1981', 'CALVIN_1981', 'DORA_1981', 'EUGENE_1981', 'FERNANDA_1981', 'GREG_1981', 'HILARY_1981', 'IRWIN_1981', 'JOVA_1981', 'KNUT_1981', 'LIDIA_1981', 'MAX_1981', 'NORMA_1981', 'OTIS_1981', 'ALETTA_1982', 'BUD_1982', 'CARLOTTA_1982', 'DANIEL_1982', 'EMILIA_1982', 'FABIO_1982', 'GILMA_1982', 'HECTOR_1982', 'IVA_1982', 'JOHN_1982', 'KRISTY_1982', 'LANE_1982', 'MIRIAM_1982', 'AKONI_1982', 'NORMAN_1982', 'EMA_1982', 'HANA_1982', 'OLIVIA_1982', 'PAUL_1982', 'ROSA_1982', 'SERGIO_1982', 'TARA_1982', 'IWA_1982', 'ADOLPH_1983', 'BARBARA_1983', 'COSME_1983', 'DALILIA_1983', 'ERICK_1983', 'FLOSSIE_1983', 'GIL_1983', 'HENRIETTE_1983', 'ISMAEL_1983', 'JULIETTE_1983', 'KIKO_1983', 'LORENA_1983', 'MANUEL_1983', 'NARDA_1983', 'OCTAVE_1983', 'PRISCILLA_1983', 'RAYMOND_1983', 'SONIA_1983', 'TICO_1983', 'VELMA_1983', 'WINNIE_1983', 'ALMA_1984', 'BORIS_1984', 'CRISTINA_1984', 'DOUGLAS_1984', 'ELIDA_1984', 'FAUSTO_1984', 'GENEVIEVE_1984', 'HERNAN_1984', 'ISELLE_1984', 'JULIO_1984', 'KELI_1984', 'KENNA_1984', 'LALA_1984', 'LOWELL_1984', 'MOKE_1984', 'MARIE_1984', 'NORBERT_1984', 'ODILE_1984', 'POLO_1984', 'RACHEL_1984', 'SIMON_1984', 'ANDRES_1985', 'BLANCA_1985', 'CARLOS_1985', 'DOLORES_1985', 'ENRIQUE_1985', 'FEFA_1985', 'GUILLERMO_1985', 'HILDA_1985', 'IGNACIO_1985', 'JIMENA_1985', 'KEVIN_1985', 'LINDA_1985', 'MARTY_1985', 'NORA_1985', 'OLAF_1985', 'PAULINE_1985', 'RICK_1985', 'SANDRA_1985', 'TERRY_1985', 'VIVIAN_1985', 'WALDO_1985', 'NELE_1985', 'XINA_1985', 'AGATHA_1986', 'BLAS_1986', 'CELIA_1986', 'DARBY_1986', 'ESTELLE_1986', 'FRANK_1986', 'GEORGETTE_1986', 'HOWARD_1986', 'ISIS_1986', 'JAVIER_1986', 'KAY_1986', 'LESTER_1986', 'MADELINE_1986', 'NEWTON_1986', 'ORLENE_1986', 'PAINE_1986', 'ROSLYN_1986', 'ADRIAN_1987', 'BEATRIZ_1987', 'CALVIN_1987', 'DORA_1987', 'EUGENE_1987', 'FERNANDA_1987', 'GREG_1987', 'HILARY_1987', 'IRWIN_1987', 'JOVA_1987', 'OKA_1987', 'KNUT_1987', 'LIDIA_1987', 'MAX_1987', 'NORMA_1987', 'OTIS_1987', 'PEKE_1987', 'PILAR_1987', 'RAMON_1987', 'SELMA_1987', 'ALETTA_1988', 'BUD_1988', 'CARLOTTA_1988', 'DANIEL_1988', 'EMILIA_1988', 'FABIO_1988', 'GILMA_1988', 'HECTOR_1988', 'IVA_1988', 'JOHN_1988', 'ULEKI_1988', 'KRISTY_1988', 'WILA_1988', 'LANE_1988', 'MIRIAM_1988', 'ADOLPH_1989', 'BARBARA_1989', 'COSME_1989', 'DALILIA_1989', 'ERICK_1989', 'FLOSSIE_1989', 'GIL_1989', 'HENRIETTE_1989', 'ISMAEL_1989', 'JULIETTE_1989', 'KIKO_1989', 'LORENA_1989', 'MANUEL_1989', 'NARDA_1989', 'OCTAVE_1989', 'PRISCILLA_1989', 'RAYMOND_1989', 'ALMA_1990', 'BORIS_1990', 'CRISTINA_1990', 'DOUGLAS_1990', 'ELIDA_1990', 'FAUSTO_1990', 'GENEVIEVE_1990', 'HERNAN_1990', 'ISELLE_1990', 'AKA_1990', 'JULIO_1990', 'KENNA_1990', 'LOWELL_1990', 'MARIE_1990', 'NORBERT_1990', 'ODILE_1990', 'POLO_1990', 'RACHEL_1990', 'SIMON_1990', 'TRUDY_1990', 'VANCE_1990', 'ANDRES_1991', 'BLANCA_1991', 'CARLOS_1991', 'DELORES_1991', 'ENRIQUE_1991', 'FEFA_1991', 'GUILLERMO_1991', 'HILDA_1991', 'IGNACIO_1991', 'JIMENA_1991', 'KEVIN_1991', 'LINDA_1991', 'MARTY_1991', 'NORA_1991', 'EKEKA_1992', 'HALI_1992', 'AGATHA_1992', 'BLAS_1992', 'CELIA_1992', 'DARBY_1992', 'ESTELLE_1992', 'FRANK_1992', 'GEORGETTE_1992', 'HOWARD_1992', 'ISIS_1992', 'JAVIER_1992', 'KAY_1992', 'LESTER_1992', 'MADELINE_1992', 'NEWTON_1992', 'ORLENE_1992', 'INIKI_1992', 'PAINE_1992', 'ROSLYN_1992', 'SEYMOUR_1992', 'TINA_1992', 'VIRGIL_1992', 'WINIFRED_1992', 'XAVIER_1992', 'YOLANDA_1992', 'ZEKE_1992', 'ADRIAN_1993', 'BEATRIZ_1993', 'CALVIN_1993', 'DORA_1993', 'EUGENE_1993', 'KEONI_1993', 'FERNANDA_1993', 'GREG_1993', 'HILARY_1993', 'IRWIN_1993', 'JOVA_1993', 'KENNETH_1993', 'LIDIA_1993', 'MAX_1993', 'NORMA_1993', 'ALETTA_1994', 'BUD_1994', 'CARLOTTA_1994', 'DANIEL_1994', 'EMILIA_1994', 'FABIO_1994', 'GILMA_1994', 'LI_1994', 'HECTOR_1994', 'ILEANA_1994', 'JOHN_1994', 'KRISTY_1994', 'LANE_1994', 'MELE_1994', 'MIRIAM_1994', 'NORMAN_1994', 'OLIVIA_1994', 'PAUL_1994', 'ROSA_1994', 'NONA_1994', 'ADOLPH_1995', 'BARBARA_1995', 'COSME_1995', 'DALILA_1995', 'ERICK_1995', 'FLOSSIE_1995', 'GIL_1995', 'HENRIETTE_1995', 'ISMAEL_1995', 'JULIETTE_1995', 'ALMA_1996', 'BORIS_1996', 'CRISTINA_1996', 'DOUGLAS_1996', 'ELIDA_1996', 'FAUSTO_1996', 'GENEVIEVE_1996', 'HERNAN_1996', 'ANDRES_1997', 'BLANCA_1997', 'CARLOS_1997', 'DOLORES_1997', 'ENRIQUE_1997', 'FELICIA_1997', 'GUILLERMO_1997', 'HILDA_1997', 'IGNACIO_1997', 'JIMENA_1997', 'OLIWA_1997', 'KEVIN_1997', 'LINDA_1997', 'MARTY_1997', 'NORA_1997', 'OLAF_1997', 'PAULINE_1997', 'RICK_1997', 'PAKA_1997', 'AGATHA_1998', 'BLAS_1998', 'CELIA_1998', 'DARBY_1998', 'ESTELLE_1998', 'FRANK_1998', 'GEORGETTE_1998', 'HOWARD_1998', 'ISIS_1998', 'JAVIER_1998', 'KAY_1998', 'LESTER_1998', 'MADELINE_1998', 'ADRIAN_1999', 'BEATRIZ_1999', 'CALVIN_1999', 'DORA_1999', 'EUGENE_1999', 'FERNANDA_1999', 'GREG_1999', 'HILARY_1999', 'IRWIN_1999', 'ALETTA_2000', 'BUD_2000', 'CARLOTTA_2000', 'UPANA_2000', 'DANIEL_2000', 'EMILIA_2000', 'FABIO_2000', 'GILMA_2000', 'HECTOR_2000', 'ILEANA_2000', 'WENE_2000', 'JOHN_2000', 'KRISTY_2000', 'LANE_2000', 'MIRIAM_2000', 'NORMAN_2000', 'OLIVIA_2000', 'PAUL_2000', 'ROSA_2000', 'ADOLPH_2001', 'BARBARA_2001', 'COSME_2001', 'ERICK_2001', 'DALILA_2001', 'FLOSSIE_2001', 'GIL_2001', 'HENRIETTE_2001', 'IVO_2001', 'JULIETTE_2001', 'KIKO_2001', 'LORENA_2001', 'MANUEL_2001', 'NARDA_2001', 'OCTAVE_2001', 'ALMA_2002', 'BORIS_2002', 'CRISTINA_2002', 'DOUGLAS_2002', 'ELIDA_2002', 'FAUSTO_2002', 'ALIKA_2002', 'ELE_2002', 'GENEVIEVE_2002', 'HERNAN_2002', 'ISELLE_2002', 'JULIO_2002', 'KENNA_2002', 'LOWELL_2002', 'HUKO_2002', 'ANDRES_2003', 'BLANCA_2003', 'CARLOS_2003', 'DOLORES_2003', 'ENRIQUE_2003', 'FELICIA_2003', 'GUILLERMO_2003', 'HILDA_2003', 'IGNACIO_2003', 'JIMENA_2003', 'KEVIN_2003', 'LINDA_2003', 'MARTY_2003', 'NORA_2003', 'OLAF_2003', 'PATRICIA_2003', 'AGATHA_2004', 'BLAS_2004', 'CELIA_2004', 'DARBY_2004', 'ESTELLE_2004', 'FRANK_2004', 'GEORGETTE_2004', 'HOWARD_2004', 'ISIS_2004', 'JAVIER_2004', 'KAY_2004', 'LESTER_2004', 'ADRIAN_2005', 'BEATRIZ_2005', 'CALVIN_2005', 'DORA_2005', 'EUGENE_2005', 'ONE_2005', 'FERNANDA_2005', 'GREG_2005', 'HILARY_2005', 'IRWIN_2005', 'JOVA_2005', 'KENNETH_2005', 'LIDIA_2005', 'MAX_2005', 'NORMA_2005', 'OTIS_2005', 'SIXTEEN_2005', 'ALETTA_2006', 'TWO_2006', 'BUD_2006', 'CARLOTTA_2006', 'DANIEL_2006', 'EMILIA_2006', 'FABIO_2006', 'GILMA_2006', 'HECTOR_2006', 'IOKE_2006', 'ILEANA_2006', 'JOHN_2006', 'KRISTY_2006', 'LANE_2006', 'MIRIAM_2006', 'THREE_2006', 'NORMAN_2006', 'OLIVIA_2006', 'FOUR_2006', 'PAUL_2006', 'EIGHTEEN_2006', 'ROSA_2006', 'TWENTY_2006', 'SERGIO_2006', 'ALVIN_2007', 'BARBARA_2007', 'THREE_2007', 'FOUR_2007', 'FIVE_2007', 'COSME_2007', 'DALILA_2007', 'ERICK_2007', 'FLOSSIE_2007', 'GIL_2007', 'HENRIETTE_2007', 'IVO_2007', 'THIRTEEN_2007', 'JULIETTE_2007', 'KIKO_2007', 'ALMA_2008', 'BORIS_2008', 'CRISTINA_2008', 'DOUGLAS_2008', 'FIVE_2008', 'ELIDA_2008', 'FAUSTO_2008', 'GENEVIEVE_2008', 'HERNAN_2008', 'KIKA_2008', 'ISELLE_2008', 'JULIO_2008', 'KARINA_2008', 'LOWELL_2008', 'MARIE_2008', 'NORBERT_2008', 'ODILE_2008', 'SEVENTEEN_2008', 'POLO_2008', 'ANDRES_2009', 'BLANCA_2009', 'CARLOS_2009', 'DOLORES_2009', 'LANA_2009', 'ENRIQUE_2009', 'FELICIA_2009', 'NINE_2009', 'MAKA_2009', 'GUILLERMO_2009', 'HILDA_2009', 'IGNACIO_2009', 'JIMENA_2009', 'TWO_2009', 'KEVIN_2009', 'LINDA_2009', 'MARTY_2009', 'NORA_2009', 'OLAF_2009', 'PATRICIA_2009', 'RICK_2009', 'NEKI_2009', 'AGATHA_2010', 'BLAS_2010', 'CELIA_2010', 'DARBY_2010', 'SIX_2010', 'ESTELLE_2010', 'EIGHT_2010', 'FRANK_2010', 'TEN_2010', 'ELEVEN_2010', 'GEORGETTE_2010', 'OMEKA_2010', 'ADRIAN_2011', 'BEATRIZ_2011', 'CALVIN_2011', 'DORA_2011', 'EUGENE_2011', 'FERNANDA_2011', 'GREG_2011', 'EIGHT_2011', 'HILARY_2011', 'JOVA_2011', 'IRWIN_2011', 'TWELVE_2011', 'KENNETH_2011', 'ALETTA_2012', 'BUD_2012', 'CARLOTTA_2012', 'DANIEL_2012', 'EMILIA_2012', 'FABIO_2012', 'GILMA_2012', 'HECTOR_2012', 'ILEANA_2012', 'JOHN_2012', 'KRISTY_2012', 'LANE_2012', 'MIRIAM_2012', 'NORMAN_2012', 'OLIVIA_2012', 'PAUL_2012', 'ROSA_2012', 'ALVIN_2013', 'BARBARA_2013', 'COSME_2013', 'DALILA_2013', 'ERICK_2013', 'FLOSSIE_2013', 'GIL_2013', 'HENRIETTE_2013', 'PEWA_2013', 'UNALA_2013', 'THREE_2013', 'IVO_2013', 'JULIETTE_2013', 'KIKO_2013', 'LORENA_2013', 'MANUEL_2013', 'NARDA_2013', 'OCTAVE_2013', 'PRISCILLA_2013', 'RAYMOND_2013', 'SONIA_2013', 'AMANDA_2014', 'BORIS_2014', 'CRISTINA_2014', 'DOUGLAS_2014', 'ELIDA_2014', 'FAUSTO_2014', 'WALI_2014', 'GENEVIEVE_2014', 'HERNAN_2014', 'ISELLE_2014', 'JULIO_2014', 'KARINA_2014', 'LOWELL_2014', 'MARIE_2014', 'NORBERT_2014', 'ODILE_2014', 'SIXTEEN_2014', 'POLO_2014', 'RACHEL_2014', 'SIMON_2014', 'ANA_2014', 'TRUDY_2014', 'VANCE_2014', 'ANDRES_2015', 'BLANCA_2015', 'CARLOS_2015', 'ELA_2015', 'HALOLA_2015', 'IUNE_2015', 'DOLORES_2015', 'ENRIQUE_2015', 'FELICIA_2015', 'EIGHT_2015', 'GUILLERMO_2015', 'HILDA_2015', 'ELEVEN_2015', 'KILO_2015', 'LOKE_2015', 'IGNACIO_2015', 'JIMENA_2015', 'KEVIN_2015', 'LINDA_2015', 'MALIA_2015', 'SIXTEEN_2015', 'NIALA_2015', 'MARTY_2015', 'OHO_2015', 'NORA_2015', 'OLAF_2015', 'PATRICIA_2015', 'RICK_2015', 'SANDRA_2015', 'NINE_2016', 'PALI_2016', 'ONE_2016', 'AGATHA_2016', 'BLAS_2016', 'CELIA_2016', 'DARBY_2016', 'ESTELLE_2016', 'FRANK_2016', 'GEORGETTE_2016', 'HOWARD_2016', 'IVETTE_2016', 'JAVIER_2016', 'KAY_2016', 'LESTER_2016', 'MADELINE_2016', 'NEWTON_2016', 'ORLENE_2016', 'PAINE_2016', 'ROSLYN_2016', 'ULIKA_2016', 'SEYMOUR_2016', 'TINA_2016', 'ADRIAN_2017', 'BEATRIZ_2017', 'CALVIN_2017', 'DORA_2017', 'EUGENE_2017', 'FERNANDA_2017', 'GREG_2017', 'HILARY_2017', 'IRWIN_2017', 'JOVA_2017', 'KENNETH_2017', 'LIDIA_2017', 'OTIS_2017', 'MAX_2017', 'NORMA_2017', 'PILAR_2017', 'RAMON_2017', 'SELMA_2017'];

/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
autocomplete(document.getElementById("locationInput"), locations);

autocomplete(document.getElementById("hurricaneInput"), hurricanes);

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function(e) {
        closeAllLists(e.target);
    });
}

function updateExtent(layer) {
    curMap.fitBounds(layer.getBounds());
}

var curHurIDsByCat = [];
var curHurIDsByCY = [];
var curHurIDsByLCY = [];

window.onload = initializeSiders();
function getVals() {
    // Get slider values
    var parent = this.parentNode;
    var slides = parent.getElementsByTagName("input");
    var slide1 = parseFloat(slides[0].value);
    var slide2 = parseFloat(slides[1].value);
    // Neither slider will clip the other, so make sure we determine which is larger
    if (slide1 > slide2) {
        var tmp = slide2;
        slide2 = slide1;
        slide1 = tmp;
    }

    curYearMin = slide1;
    curYearMax = slide2;

    //var displayElement = parent.getElementsByClassName("rangeValues")[0];
    //displayElement.innerHTML = slide1 + " - " + slide2;
    document.getElementById("yearInputMin").value = curYearMin;
    document.getElementById("yearInputMax").value = curYearMax;
}

function initializeSiders() {
    // Initialize Sliders
    var sliderSections = document.getElementsByClassName("range-slider");
    for (var x = 0; x < sliderSections.length; x++) {
        var sliders = sliderSections[x].getElementsByTagName("input");
        for (var y = 0; y < sliders.length; y++) {
            if (sliders[y].type === "range") {
                sliders[y].oninput = getVals;
                // Manually trigger event first time to display values
                sliders[y].oninput();
            }
        }
    }


}

function yearMinInputChangeRange(){
    document.getElementById("minYearRange").value = document.getElementById("yearInputMin").value;
}

function yearMaxInputChangeRange(){
    document.getElementById("maxYearRange").value = document.getElementById("yearInputMax").value;
}


function clearMap() {
    if (curPointLayer) {
        curMap.removeLayer(curPointLayer);
    };
    if (curLineLayer) {
        curMap.removeLayer(curLineLayer);
    };
    if (curLocationLayer) {
        curMap.removeLayer(curLocationLayer);
    };
	if (selection) {
        selectedLayer.resetStyle(selection);
	}
    if (curPointLayer2) {
        curMap.removeLayer(curPointLayer2);
    }
    document.getElementById("scatterplot-div").innerHTML = "<svg width = 250px height = 200px ><text font-size=15px fill=white><tspan x=50 y=50 >Select a location</tspan><tspan x=50 y=70 >in query panel</tspan></text></svg>";
    document.getElementById("lineGraph-div").innerHTML = "<svg width = 250px height = 200px ><text font-size=15px fill=white><tspan x=50 y=50 >Select a hurricane in</tspan><tspan x=50 y=70 >query panel option #1</tspan><tspan x=50 y=90 >or on the map</tspan></text></svg>";
    removeElement("point-text");
    removeElement("point-legend");
}

function applySetting() {

    // remove current layer if exists
    if (curPointLayer) {
        curMap.removeLayer(curPointLayer);
    };
    if (curLineLayer) {
        curMap.removeLayer(curLineLayer);
    };
    if (curLocationLayer) {
        curMap.removeLayer(curLocationLayer);
    };
    if (curPointLayer2) {
        curMap.removeLayer(curPointLayer2);
    }

    if (selection) {
        selectedLayer.resetStyle(selection);
    }

    $('#mapid').hide();
    $('#img').show();

    curHurIDsByCat = [];
    curHurIDsByCY = [];
    curHurIDsByLCY = [];

    removeElement("point-text");
    removeElement("point-legend");

    // clear up
    createScatter();
    createLineGraph();
    document.getElementById("scatterplot-div").innerHTML = "<svg width = 250px height = 200px ><text font-size=15px fill=white><tspan x=50 y=50 >Select a location</tspan><tspan x=50 y=70 >in query panel</tspan></text></svg>";
    document.getElementById("lineGraph-div").innerHTML = "<svg width = 250px height = 200px ><text font-size=15px fill=white><tspan x=50 y=50 >Select a hurricane in</tspan><tspan x=50 y=70 >query panel option #1</tspan><tspan x=50 y=90 >or on the map</tspan></text></svg>";

    // Apply setting after click the button
    curLocation = document.getElementById("locationInput").value;
    curHurricane = document.getElementById("hurricaneInput").value;

    // Check the year input
    curYearMin = document.getElementById("yearInputMin").value;
    curYearMax = document.getElementById("yearInputMax").value;

    if (curYearMin<1851 || curYearMin>2017 || curYearMax<1851 || curYearMax>2017){
        $('#img').hide();
        $('#mapid').show();
        alert("All years must be within the year range (1851-2017).","Alert");
        return;
    }else
        if (curYearMin>curYearMax)
        {
            $('#img').hide();
            $('#mapid').show();
            alert("Start year must not be larger than end year.","Alert");
            return;
        }

    // Scenario #1: check if hurricane name is disabled, if yes, jump to option 2, if not, then option #1: check if it is empty
    //      0-yes, alert: empty input of hurricane name!
    //      0-no, then check if hurricane name matches any one
    //          0.1-yes, map it
    //          0.2-no, alert: no such specific hurricane!
    // Scenario #2 or #3: if hurricane name is disabled, check checkboxes and year range;
    // then check if curLocation has input:

    // Scenario #3 if yes: check if curLocation matches any location, if yes, check if there is any selected hurricane in curLocation
    //          3.1-yes: if yes. then zoom in to the extent of the location, and show the corresponding hurricanes within that location
    //          3.2-no: alert: no such location
    // Scenario #2 if no: then empty location, show all the hurricanes within the year range


    // Scenario #1: if hurricane name is abled, check if it is empty

    if (document.getElementById("hurricaneInput").disabled == false) {
        if (curHurricane == "") {
            $('#img').hide();
            $('#mapid').show();
            alert("Empty input of hurricane name!","Alert");
        } else {
            // if found
            if (checkValue(curHurricane, hurricanes)) {

                // TODO: map it
                // load the lines
                $.ajax("data/line.json", {
                    dataType: "json",
                    success: function (data) {


                        // Define the geojson layer and add it to the map
                        curLineLayer = L.geoJson(data, {
                            // set up the line style
                            style: function (feature, layer) {
                                return lineStyle(feature, layer);
                            },
                            // filter by name
                            filter: function (feature, layer) {
                                return filterHurByName(feature, layer);
                            }
                        });

                        curMap.addLayer(curLineLayer);

                        // change the map extent to the hurricane
                        updateExtent(curLineLayer);

                        // add the points to the map
                        $.ajax("data/point.json", {
                            dataType: "json",
                            success: function (data) {

                                // Define the geojson layer and add it to the map
                                curPointLayer = L.geoJson(data, {
                                    /*style: function(feature,layer){
									    return pointStyle(feature,layer);
									},*/
                                    // filter by name
                                    filter: function (feature, layer) {
                                        return filterPointByName(feature, layer);
                                    },
                                    // on each feature of states
                                    pointToLayer: function (feature, latlng) {
                                        return pointToLayer(feature, latlng);
                                    }
                                });

                                $('#img').hide();
                                $('#mapid').show();
                                curMap.addLayer(curPointLayer);

                                // update popden info
                                var mean=0, max=0, min=99999, count=0;
                                curPointLayer.eachLayer(function (layer) {
                                    var popden = layer.feature.properties.popden;
                                    if (popden>0)
                                    {
                                        count++;
                                        mean+=popden;
                                        if (popden<min)
                                            min=popden;
                                        if (popden>max)
                                            max=popden;
                                    }
                                });
                                mean/=count;
                                popDenValue={
                                    max: max,
                                    mean: mean,
                                    min: min
                                };
                                updateLegend(curMap);

                                // update the line graph
                                $.ajax("data/point.json", {
                                    dataType: "json",
                                    success: function (data) {

                                        // Define the geojson layer and add it to the map
                                        curPointLayer2 = L.geoJson(data, {
                                            filter: function (feature, layer) {
                                                return (feature.properties.hurName == curHurricane);
                                            }
                                        });

                                        // update the line graph
                                        updateLineGraph(curPointLayer2);

                                    }
                                });

                            }
                        });
                    }
                });

            }
            // if not found:
            else {
                $('#img').hide();
                $('#mapid').show();
                alert("No hurricane named " + curHurricane + " (case sensitive). Please choose a hurricane with specific year in the dropdown list.","Alert");
            }
        }
    }
    // Scenario #2 or #3: if hurricane name is disabled, check checkboxes and year range;
    else {
        // "values" is a vector containing all the selected categories
        var checkboxes = document.querySelectorAll('input[name="category"]:checked'),
            values = [];
        Array.prototype.forEach.call(checkboxes, function (el) {
            values.push(el.value);
        });

        /*change the order here:
        1. filter hurricanes by categories and year range
        2. check location
        3. if location matched, then filterHurByL, update curLineLayer
        4. add curLineLayer to curMap
        */

        // load the lines
        $.ajax("data/line.json", {
            dataType: "json",
            success: function(data) {
                // update curHurIDsByCat values
                L.geoJson(data, {
                    filter: function(feature, layer) {
                        return filterSegByCat(feature, layer, values);
                    }
                });

                // update curHurIDsByCY
                curLineLayer = L.geoJson(data, {
                    style: function (feature, layer) {
                        return lineStyle(feature, layer);
                    },
                    // filter by name
                    filter: function (feature, layer) {
                        return filterHurByCY(feature, layer);
                    },
                    // on each feature of line
                    onEachFeature: lineOnEachFeature // which will allow user to click
                });

                console.log(curHurIDsByCY.length + " hurricanes after cat and year");

                // then check if curLocation has input:
                // Scenario #3 if yes - curLocation is not empty
                if (curLocation != "") {

                    // if found:
                    if (checkValue(curLocation, locations)) {

                        // map the hurricanes with selected categories and year range + within the specific location!!!
                        var curLineLayerJSON = curLineLayer.toGeoJSON();
                        console.log(curLineLayerJSON.features.length + " of hurricane segments after cat and year");

                        if (curLineLayerJSON.features.length > 5000){
                            alert("The location-based analysis needs a few more seconds.","Warning");
                        }

                        $.ajax("data/polygons.json", {
                            dataType: "json",
                            success: function (data) {
                                // if it is a city
                                if (curLocation.indexOf(',') > -1) {
                                    // update curLocationJSON
                                    curLocationLayer = L.geoJson(curUrbanLayer.toGeoJSON(), {
                                        style: {
                                            "fillColor": '#3f8adb',
                                            "fillOpacity": 0.6,
                                            "weight": 0
                                        },
                                        // filter by location
                                        filter: function (feature, layer) {
                                            return filterPolygonByL(feature, layer);
                                        }
                                    });

                                }
                                // if it is a state
                                else {
                                    // update curLocationJSON
                                    curLocationLayer = L.geoJson(data, {
                                        style: {
                                            "fillColor": '#3f8adb',
                                            "fillOpacity": 0.6,
                                            "weight": 0
                                        },
                                        // filter by location
                                        filter: function (feature, layer) {
                                            return filterPolygonByL(feature, layer);
                                        }
                                    });


                                }

                                // change the map extent to the location
                                updateExtent(curLocationLayer);
                                curMap.addLayer(curLocationLayer);

                                $.ajax("data/hurID.json", {
                                    dataType: "json",
                                    success: function (data) {

                                        // filter hurricanes by curHurIDsByCY
                                        var hurLayerByL = L.geoJson(data, {
                                            filter: function (feature, layer) {
                                                return filterLineByCY(feature, layer);
                                            }
                                        });

                                        // update curHurIDsByLCY
                                        L.geoJson(hurLayerByL.toGeoJSON(), {
                                            filter: function (feature, layer) {
                                                // to get the curHurIDs
                                                return filterLineByL(feature, layer);
                                            }
                                        });

                                        console.log(curHurIDsByLCY.length + " hurricanes within this location ");

                                        // if there is no resulting hurricanes
                                        if (curHurIDsByLCY.length == 0) {
                                            $('#img').hide();
                                            $('#mapid').show();
                                            alert("There is no resulting hurricanes based on current settings.","Result")
                                        }

                                        // if there is hurricane
                                        else {
                                            // if # of resulting hurricanes is <= 5, then add points to map
                                            if (curHurIDsByLCY.length <= 5) {
                                                // Map: Zoom to the hurricane line; Add points;
                                                // Info panel: individual hurricane graph should update;
                                                // add the points to the map
                                                $.ajax("data/point.json", {
                                                    dataType: "json",
                                                    success: function (data) {

                                                        // Define the geojson layer and add it to the map
                                                        curPointLayer = L.geoJson(data, {
                                                            //style: function(feature,layer){
                                                            //    return pointStyle(feature,layer);
                                                            //},
                                                            // filter by name
                                                            filter: function (feature, layer) {
                                                                return filterPointByIDs(feature, layer);
                                                            },
                                                            // on each feature of states
                                                            pointToLayer: function (feature, latlng) {
                                                                return pointToLayer(feature, latlng);
                                                            }
                                                        });

                                                        curMap.addLayer(curPointLayer);

                                                        // update popden info
                                                        var mean=0, max=0, min=99999, count=0;
                                                        curPointLayer.eachLayer(function (layer) {
                                                            var popden = layer.feature.properties.popden;
                                                            if (popden>0)
                                                            {
                                                                count++;
                                                                mean+=popden;
                                                                if (popden<min)
                                                                    min=popden;
                                                                if (popden>max)
                                                                    max=popden;
                                                            }
                                                        });
                                                        mean/=count;
                                                        popDenValue={
                                                            max: max,
                                                            mean: mean,
                                                            min: min
                                                        };
                                                        updateLegend(curMap);



                                                        // update the line graph
                                                        if (curHurIDsByLCY.length == 1) {
                                                            // update the line graph
                                                            $.ajax("data/point.json", {
                                                                dataType: "json",
                                                                success: function (data) {

                                                                    // Define the geojson layer and add it to the map
                                                                    curPointLayer2 = L.geoJson(data, {
                                                                        filter: function (feature, layer) {
                                                                            return (feature.properties.HurID == curHurIDsByLCY[0]);
                                                                        }
                                                                    });

                                                                    // update the line graph
                                                                    updateLineGraph(curPointLayer2);

                                                                }
                                                            });
                                                        } else {

                                                            createLineGraph();
                                                            document.getElementById("lineGraph-div").innerHTML = "<svg width = 250px height = 200px ><text font-size=15px fill=white><tspan x=50 y=50 >Select a hurricane in</tspan><tspan x=50 y=70 >query panel option #1</tspan><tspan x=50 y=90 >or on the map</tspan></text></svg>";

                                                        }
                                                    }
                                                });// end of ajax - points.json

                                            } // end of adding points in scenario #3 when the # of hurricanes is <= 5
                                            else
                                            {
                                                popDenValue={
                                                    max: 0,
                                                    mean: 0,
                                                    min: 0
                                                };
                                                updateLegend(curMap);

                                            }

                                            curLineLayer = L.geoJson(curLineLayerJSON, {
                                                style: function (feature, layer) {
                                                    return lineStyle(feature, layer);
                                                },
                                                filter: function (feature, layer) {
                                                    // to get the curHurIDsByLCY
                                                    return filterHurByLCY(feature, layer);
                                                },
                                                // on each feature of line
                                                onEachFeature: lineOnEachFeature
                                            });

                                            // TODO: map the hurricanes within the location
                                            $('#img').hide();
                                            $('#mapid').show();
                                            curMap.addLayer(curLineLayer);

                                            // create tempPointLayer for scatterplot update
                                            var tempPointLayer;
                                            $.ajax("data/point.json", {
                                                dataType: "json",
                                                success: function (data) {

                                                    // Define the geojson layer and add it to the map
                                                    tempPointLayer = L.geoJson(data, {
                                                        //style: function(feature,layer){
                                                        //    return pointStyle(feature,layer);
                                                        //},
                                                        // filter by name
                                                        filter: function (feature, layer) {
                                                            return filterPointByLCY(feature, layer);
                                                        },
                                                    });

                                                    // update the scatterplot
                                                    $('#scatterplotTitle').html("Historical Hurricanes of " + curLocation);
                                                    graphData = []
                                                    tempPointLayer.eachLayer(function (layer) {

                                                        /*if (curHurIDsByLCY.includes(layer.feature.properties.HurID) && isOverlap.features.length > 0) {*/
                                                        var day = layer.feature.properties.DD;
                                                        var month = layer.feature.properties.MM;
                                                        var year = layer.feature.properties.YYYY;
                                                        var hour = layer.feature.properties.HH;

                                                        var show_date = year + "-" + month + "-" + day + " " + hour + ":00";

                                                        var category = layer.feature.properties.Cat;
                                                        var hurName = layer.feature.properties.hurName;
                                                        var cur_wind = layer.feature.properties.Wind;

                                                        var check = 0;
                                                        if (category == "H5") {
                                                            check = 8
                                                        } else if (category == "H4") {
                                                            check = 7
                                                        } else if (category == "H3") {
                                                            check = 6
                                                        } else if (category == "H2") {
                                                            check = 5
                                                        } else if (category == "H1") {
                                                            check = 4
                                                        } else if (category == "TS") {
                                                            check = 3
                                                        } else if (category == "TD") {
                                                            check = 2
                                                        } else if (category == "EX") {
                                                            check = 1
                                                        }

                                                        var xDate = month + "-" + day + " " + hour + ":00";
                                                        xDate = d3.timeParse("%m-%d %I:%M")(xDate);

                                                        if (check != 0) {
                                                            var new_entry = {
                                                                "show_date": show_date,
                                                                "xOrder": xDate,
                                                                "value": cur_wind,
                                                                "category": category,
                                                                "yOrder": check,
                                                                "hurName": hurName
                                                            }
                                                            graphData.push(new_entry)
                                                        }

                                                    });

                                                    if (graphData.length > 0){
                                                        createScatter(graphData);
                                                    }
                                                    else {
                                                        alert("No hurricane is within this location.");
                                                    }
                                                }
                                            });// end of ajax - points.json


                                        } // end of scenario #3 if location is found and resulting hurricane # > 0

                                    }
                                }); // ajax - hurID.json

                            }
                        }); // ajax - polygons.json

                    } // end of scenario #3 if location is found
                    // if not found:
                    else {
                        $('#img').hide();
                        $('#mapid').show();
                        alert("The location " + curLocation + " is not found (case sensitive). Please choose a location (state or city) in the dropdown list.","Alert");
                    } // end of scenario #3 if location is not found

                } // end of scenario #3

                // Scenario #2: if locationInput is empty, directly map the curLineLayer
                else {

                    if (curHurIDsByCY.length == 0) {
                        $('#img').hide();
                        $('#mapid').show();
                        alert("There is no resulting hurricanes based on current settings.","Result")
                    }

                    else{
                        // only one hurricane selected after filtering by cat and year
                        if (curHurIDsByCY.length <= 5) {
                            // Map: Zoom to the hurricane line; Add points;
                            // Info panel: individual hurricane graph should update;
                            // add the points to the map
                            $.ajax("data/point.json", {
                                dataType: "json",
                                success: function (data) {

                                    // Define the geojson layer and add it to the map
                                    curPointLayer = L.geoJson(data, {
                                        /*style: function(feature,layer){
									    return pointStyle(feature,layer);
									},*/
                                        // filter by name
                                        filter: function (feature, layer) {
                                            return filterPointByIDsCY(feature, layer);
                                        },
                                        // on each feature of states
                                        pointToLayer: function (feature, latlng) {
                                            return pointToLayer(feature, latlng);
                                        }
                                    });

                                    $('#img').hide();
                                    $('#mapid').show();
                                    curMap.addLayer(curPointLayer);

                                    // update popden info
                                    var mean=0, max=0, min=99999, count=0;
                                    curPointLayer.eachLayer(function (layer) {
                                        var popden = layer.feature.properties.popden;
                                        if (popden>0)
                                        {
                                            count++;
                                            mean+=popden;
                                            if (popden<min)
                                                min=popden;
                                            if (popden>max)
                                                max=popden;
                                        }
                                    });
                                    mean/=count;
                                    popDenValue={
                                        max: max,
                                        mean: mean,
                                        min: min
                                    };
                                    updateLegend(curMap);

                                    if (curHurIDsByCY.length == 1) {
                                        // update the line graph
                                        $.ajax("data/point.json", {
                                            dataType: "json",
                                            success: function (data) {

                                                // Define the geojson layer and add it to the map
                                                curPointLayer2 = L.geoJson(data, {
                                                    filter: function (feature, layer) {
                                                        return (feature.properties.HurID == curHurIDsByCY[0]);
                                                    }
                                                });

                                                // update the line graph
                                                updateLineGraph(curPointLayer2);

                                            }
                                        });
                                    }
                                }
                            });
                        }

                        $('#img').hide();
                        $('#mapid').show();
                        curMap.addLayer(curLineLayer);

                        // change the map extent to the hurricane
                        updateExtent(curLineLayer);

                        if (curHurIDsByCY.length >= 100) {
                            alert("The number of resulting hurricanes is more than 100, therefore the interaction with the map will be slow.\n You can consider selecting less hurricane categories or making the year range smaller.","Warning");
                        }

                    }
                } // end of Scenario #2
            }
        });// end of ajax line.json

    } // end of Scenario #2 or #3

}

function filterPointByName(feature, layer) {
    return (feature.properties.hurName == curHurricane && feature.properties.popden > 0);
}

function filterPointByIDs(feature, layer) {
    return (checkValue(feature.properties.HurID, curHurIDsByLCY) && feature.properties.popden > 0);

}

function filterPointByLCY(feature, layer) {
    return (checkValue(feature.properties.HurID, curHurIDsByLCY) &&
            feature.properties.popden > 0) &&
        turf.booleanPointInPolygon(feature, curLocationJSON);
}

function filterPointByIDsCY(feature, layer) {
    return (checkValue(feature.properties.HurID, curHurIDsByCY) && feature.properties.popden > 0);
}

function pointToLayer(feature, latlng) {
    //create marker options
    var options = {
        fillColor: "#add8e6",
        weight: 2,
        opacity: 1,
        fillOpacity: 0
    };

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(feature.properties.popden);
    options.color = calcPointColor(feature.properties.Cat);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    // create pop up for features
    createPointPopup(feature, layer, options.radius);

    ///event listeners to open popup on hover and update the chart in panel on click
    layer.on({
        mouseover: function () {
            this.openPopup();
        },
        mouseout: function () {
            this.closePopup();
        },
        // update the line graph on clicking the points
        click: function () {
            //hightlightLineGraphPoints();
        }

    });

    //return the circle marker to the L.geoJson point To Layer option
    return layer;
}

// proportional symbols
// point color should be consistent with line color
function calcPointColor(attValue){

    var colorScheme = ["#ffff00", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"]
    var pointColor;

    switch (attValue) {
        case 'H5':
            pointColor = colorScheme[4];
            break;
        case 'H4':
            pointColor = colorScheme[3];
            break;
        case 'H3':
            pointColor = colorScheme[2];
            break;
        case 'H2':
            pointColor = colorScheme[1];
            break;
        case 'H1':
            pointColor = colorScheme[0];
            break;
        case 'TS':
            pointColor = "#58e095";
            break;
        case 'TD':
            pointColor = "#70b5e4";
            break;
        case 'EX':
            pointColor = "#cccccb";
            break;
        default:
            pointColor = "#ffffff";
    }

    return pointColor;
}


// calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 5;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area / Math.PI);

    return radius;
};

// a consolidated popup-creation function
function createPointPopup(feature, layer, radius) {

    //popup content is now just the city name
    var hurName = feature.properties.hurName;

    var YYYY = feature.properties.YYYY;
    var MM = feature.properties.MM;
    var DD = feature.properties.DD;
    var HH = feature.properties.HH;
    //var State = feature.properties.State;
    var Wind = feature.properties.Wind;
    var popden = feature.properties.popden;

    //add formatted attribute to panel content string
    var popupContent = "<p style='line-height: 0;'><b>Population affected per square mile:</b> " + Math.round(popden, 2) + "</p>";
    popupContent += "<p style='line-height: 0;'><b>Hurricane name:</b> " + hurName + "</p>";
    popupContent += "<p style='line-height: 0;'><b>Date:</b> " + YYYY + "-" + MM + "-" + DD + "&nbsp&nbsp" + HH + ":00 </p>";
    popupContent += "<p style='line-height: 0;'><b>Wind:</b> " + Wind + " knots (kts)</p>"
    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -radius),
        closeButton: false
    });
};

function lineStyle(feature, layer) {

    var colorScheme = ["#ffff00", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"]
    var thickness = [1, 2, 2.5, 3, 3.5, 4, 5]

    switch (feature.properties.Cat) {
        case 'H5':
            return {
                color: colorScheme[4],
                "weight": thickness[6]
            };
        case 'H4':
            return {
                color: colorScheme[3],
                "weight": thickness[5]
            };
        case 'H3':
            return {
                color: colorScheme[2],
                "weight": thickness[4]
            };
        case 'H2':
            return {
                color: colorScheme[1],
                "weight": thickness[3]
            };
        case 'H1':
            return {
                color: colorScheme[0],
                "weight": thickness[2]
            };
        case 'TS':
            return {
                color: "#58e095",
                "weight": thickness[1]
            };
        case 'TD':
            return {
                color: "#70b5e4",
                "weight": thickness[1]
            };
        case 'EX':
            return {
                color: "#cccccb",
                "weight": thickness[1]
            };
        default:
            return {
                color: "#ffffff",
                "weight": thickness[0]
            };
    }
}

function filterHurByName(feature, layer) {
    return (feature.properties.hurName == curHurricane);
}

function filterPointByHurID(feature, layer) {
    return (feature.properties.hurName == curHurricane)
}

function filterSegByCat(feature, layer, values) {
    // "values" is a vector containing all the selected categories
    if (checkValue(feature.properties.Cat, values)) {
        if (!checkValue(feature.properties.HurID, curHurIDsByCat)) {
            curHurIDsByCat.push(feature.properties.HurID);
        }
    }
    return false;
}

function filterHurByCY(feature, layer) {

    // find all the hurricanes that have at least one segment which meets the selected categories and the selected year range
    var result = (checkValue(feature.properties.HurID, curHurIDsByCat) &&
                  feature.properties.YYYY >= curYearMin &&
                  feature.properties.YYYY <= curYearMax);

    if (result) {
        if (!checkValue(feature.properties.HurID, curHurIDsByCY)) {
            curHurIDsByCY.push(feature.properties.HurID);
        }
    }

    return result;
}

function filterPolygonByL(feature, layer) {
    if (feature.properties.NAME == curLocation) {
        curLocationJSON = feature;
        return true;
    }
    return false;
}

function filterLineByCY(feature, layer) {
    return (checkValue(feature.properties.HurID, curHurIDsByCY));
}

// feature here is filtered by cat and year already
function filterLineByL(feature, layer) {
    var isOverlap = turf.lineIntersect(feature, curLocationJSON);

    if (isOverlap.features.length > 0) {
        if (!checkValue(feature.properties.HurID, curHurIDsByLCY)) {
            curHurIDsByLCY.push(feature.properties.HurID);
        }
    }
    return false;
}

function filterHurByLCY(feature, layer) {
    // find all the hurricanes that have at least one segment which meets the selected categories, crossing the selected location, and within the selected year range
    return checkValue(feature.properties.HurID, curHurIDsByLCY);
}

var lineSelection;
function lineOnEachFeature(feature,layer){

    //popup content is now just the city name
    var popupContent = "<b>Hurricane Name: </b>" + feature.properties.hurName + "<br />";
    popupContent += "<b>Click to see more info in the graph</b>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        //offset: new L.Point(0, 0),
        closeButton: false
    });

    layer.on({
        mouseover: function(e){
            var pop = e.target.getPopup();
            pop.setLatLng(e.latlng).openOn(curMap);
        },
        mouseout: function () {
            this.closePopup();
        },
        click: function (e) {
            if (lineSelection != e.target) {

                lineSelection = e.target;
                var curLineSeg = feature;

                // update the line graph
                $.ajax("data/point.json", {
                    dataType: "json",
                    success: function (data) {

                        // Define the geojson layer and add it to the map
                        if (curPointLayer2) {
                            curMap.removeLayer(curPointLayer2);
                        }
                        curPointLayer2 = L.geoJson(data, {
                            filter: function (feature, layer) {
                                return (feature.properties.HurID == curLineSeg.properties.HurID && feature.properties.popden > 0);
                            },
                            pointToLayer: function (feature, latlng) {
                                return pointToLayer(feature, latlng);
                            }
                        });

                        curMap.addLayer(curPointLayer2);
						
						// update popden info
						var mean=0, max=0, min=99999, count=0;
						curPointLayer2.eachLayer(function (layer) {
							var popden = layer.feature.properties.popden;
							if (popden>0)
							{
								count++;
								mean+=popden;
								if (popden<min)
									min=popden;
								if (popden>max)
									max=popden;
							}
						});
						mean/=count;
						popDenValue={
							max: max,
							mean: mean,
							min: min
						};
						updateLegend(curMap);

                        var tempPointLayer = L.geoJson(data, {
                            filter: function (feature, layer) {
                                return (feature.properties.HurID == curLineSeg.properties.HurID);
                            }
                        });
                        // update the line graph
                        updateLineGraph(tempPointLayer);

                    }
                });


            }
        }
    });
}

function checkValue(value, arr) {
    var status = false;

    for (var i = 0; i < arr.length; i++) {
        var name = arr[i];
        if (name == value) {
            status = true;
            break;
        }
    }

    return status;
}

function getCheckedCheckboxesFor() {
    // "values" is a vector containing all the selected categories
    var checkboxes = document.querySelectorAll('input[name="category"]:checked'),
        values = [];
    Array.prototype.forEach.call(checkboxes, function (el) {
        values.push(el.value);
    });
    if (values.length == 0) {
        document.getElementById("hurricaneInput").disabled = false;
    } else {
        document.getElementById("hurricaneInput").disabled = true;
    }
}

// check and remove element by id
function removeElement(elementId)
{
    var checkElement = document.getElementById(elementId);
    if (checkElement!==null)
    {
        checkElement.parentNode.removeChild(checkElement);
    }
}

// update the point symbol legend
function updateLegend(map){

    removeElement("point-text");
    removeElement("point-legend");
	
    if (popDenValue['max']==0)
        return;

    var container = document.getElementsByClassName("legend-control-container")[0];

    $(container).append('<text id="point-text">Pop Density Affected</text>');

    var svg = '<svg id="point-legend" width="120px" height="70px">';
    var circles = {
        max: 25,
        mean: 45,
        min: 65
    };
    for (var circle in circles){
        svg += '<circle class="legend-circle" id="' + circle + '" fill="#000000" fill-opacity="0" stroke="#666666" stroke-width="2" opacity="1" cx="35"/>';
        svg += '<text id="' + circle + '-text" fill="#FFFFFF" x="75" y="' + circles[circle] + '"></text>';
    };
    svg += "</svg>";

    $(container).append(svg);

    for (var key in popDenValue){
        var radius = calcPropRadius(popDenValue[key]);
        $('#'+key).attr({
            cy: 69 - radius,
            r: radius
        });
        $('#'+key+'-text').text(Math.round(popDenValue[key]*100)/100);
    };
};


//create new sequence controls to control the years
function createLegend(map) {
    //Create a SequenceControl object
    var LegendControl = L.Control.extend({
        options: {
            position: 'topright'
        },
        onAdd: function (map) {
            //Create a DOM container to append to on to the map
            var container = L.DomUtil.create('div', 'legend-control-container');
            //Append the title
            $(container).append('<div id="temporal-legend" style="font-size:15px;  margin:2px"><b>LEGEND</b></div>')

            //Append the legend symbols
            var cityArea = '<img src = img/SVG/cityarea.svg width=40></img><text> City Area</text><br>'
            var stateBoundary = '<img src = img/SVG/stateboundary.svg width=40></img><text> State Boundary</text><br>'
            var hCategory = '<text><b>Hurricane Categories</b></text><br>'
            hCategory += '<img src = img/SVG/h5.png width=40 height=4.65></img>'
            hCategory += '<text> H5</text><br>'
            hCategory += '<img src = img/SVG/h4.png width=40 height=4.15></img>'
            hCategory += '<text> H4</text><br>'
            hCategory += '<img src = img/SVG/h3.png width=40 height=3.65></img>'
            hCategory += '<text> H3</text><br>'
            hCategory += '<img src = img/SVG/h2.png width=40 height=3.15></img>'
            hCategory += '<text> H2</text><br>'
            hCategory += '<img src = img/SVG/h1.png width=40 height=2.65></img>'
            hCategory += '<text> H1</text><br>'
            hCategory += '<img src = img/SVG/ts.png width=40 height=2.15></img>'
            hCategory += '<text> TS</text><br>'
            hCategory += '<img src = img/SVG/td.png width=40 height=2.15></img>'
            hCategory += '<text> TD</text><br>'
            hCategory += '<img src = img/SVG/ex.png width=40 height=2.15></img>'
            hCategory += '<text> EX</text><br>'
            hCategory += '<img src = img/SVG/other.png width=40 height=1.15></img>'
            hCategory += '<text> Others</text><br>'

            //add attribute legend to container
            $(container).append(cityArea);
            $(container).append(stateBoundary);
            $(container).append(hCategory);

            return container;
        }
    });

    map.addControl(new LegendControl());

}

// scatterplot
function createScatter(graphData) {

    try{
        $('#scatterplotTitle').html("Historical Hurricanes of " + curLocation + ", " + curYearMin + "-" + curYearMax);
        // set y axis min and max values
        var ymax = Math.max.apply(Math, graphData.map(function(o) {
            return o.yOrder;
        }))
        var ymin = Math.min.apply(Math, graphData.map(function(o) {
            return o.yOrder;
        }))

        // set x axis min and max values

        var xDateMin = "1-1 00:00";
        xDateMin = d3.timeParse("%m-%d %I:%M")(xDateMin);
        var xDateMax = "12-31 23:59";
        xDateMax = d3.timeParse("%m-%d %I:%M")(xDateMax);

        /*var xmax = Math.max.apply(Math, graphData.map(function(o) {
            return o.xOrder;
        }))
        var xmin = Math.min.apply(Math, graphData.map(function(o) {
            return o.xOrder;
        }))
        */

        //remove previous contents
        document.getElementById("scatterplot-div").innerHTML = "";

        // set the dimensions and margins of the graph
        var margin = {
            top: 10,
            right: 50,
            bottom: 10,
            left: 50
        },
            width = 350 - margin.left - margin.right,
            height = 220 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#scatterplot-div")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 350 250")
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis
        var x = d3.scaleLinear()
        .domain([xDateMin,xDateMax])
        .range([0, width]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axisWhite")
            .call(d3.axisBottom(x).tickSize(0))
            .selectAll("text").remove()

        // text label for the x axis
        svg.append("text")
            .attr("transform",
                  "translate(" + (width/2) + " ," +
                  (height + margin.top + 10) + ")")
            .attr("fill", "white")
            .style("text-anchor", "middle")
            .style("font", "12px verdana")
            .text("Month (Jan-Dec)");

        // set format y axis tick label
        var tickLabels = ["", "EX", "TD", "TS", "H1", "H2", "H3", "H4", "H5"]

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([0, 8])
        .range([height, 0]);

        var myAxis = d3.axisLeft()
        .scale(y)
        .tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8])
        .tickFormat(function(d, i) {
            return tickLabels[i]
        });

        svg.append("g")
            .attr("class", "axisWhite")
            .call(myAxis.tickSizeOuter(0));

        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left - 95)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .attr("fill", "white")
            .style("text-anchor", "middle")
            .style("font", "12px verdana")
            .text("Hurricane Category");

        // Add a tooltip div
        var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("display", "none");

        // A function that change this tooltip when the user hover a point
        var mouseover = function(d) {
            d3.select(this).attr("r", 4).style("fill", "red");
            tooltip
                .style("display", "inline");
        }

        var mousemove = function (d) {
            tooltip
                .html("<p style='font-size:12px;margin-left=3px;padding-left=10px;'><b>Hurricane Name: </b>" + d.hurName + "<br/>" +
                      "<b>Date:</b> " + d.show_date + " UTC<br/>"  +
                      "<b>Category:</b> " + d.category + "</p>")
                .style("left", (d3.event.pageX - 150) + "px")
                .style("top", (d3.event.pageY - 90) + "px");
        }

        // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        var mouseleave = function (d) {
            d3.select(this).attr("r", 4).style("fill", "#69b3a2");
            tooltip
                .transition()
                .duration(200)
                .style("display", "none");
        }

        // Add dots
        svg.append('g')
            .selectAll("dot")
        // .data(graphData.filter(function(d,i){return i<50})) // the .filter part is just to keep a few dots on the chart, not all of them
            .data(graphData)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
            return x(d.xOrder);
        })
            .attr("cy", function (d) {
            return y(d.yOrder);
        })
            .attr("r", 4)
            .style("fill", "#69b3a2")
            .style("opacity", 0.8)
            .style("stroke", "white")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    }
    catch (err){
        $('#scatterplotTitle').html("Historical Hurricanes by Location");
    }
}

function updateLineGraph(curPointLayer){
    var graphData = [];

    curPointLayer.eachLayer(function (layer) {
        var hurName = layer.feature.properties.hurName;
        var y = layer.feature.properties.YYYY;
        var hour = layer.feature.properties.HH;
        var day = layer.feature.properties.DD;
        var month = layer.feature.properties.MM;
        var doy = layer.feature.properties.doy;
        var cur_wind = layer.feature.properties.Wind;

        var new_entry = {
            "date": doy,
            "value": cur_wind,
            "day": day,
            "hour": hour,
            "month": month,
            "y":y,
            "hurName": hurName
        }
        graphData.push(new_entry)


    });

    createLineGraph(graphData);
}
// line graph
function createLineGraph(data) {

    try{
        if (data[0].hurName != ""){
            $('#lineGraphTitle').html("Individual Hurricane Info of " + data[0].hurName);
        }
        else{
            $('#lineGraphTitle').html("Individual Unnamed Hurricane Info");
        }


        var ymax = Math.max.apply(Math, data.map(function (o) {
            return o.value;
        }))
        var ymin = Math.min.apply(Math, data.map(function (o) {
            return o.value;
        }))

        var xmax = Math.max.apply(Math, data.map(function (o) {
            return o.date;
        }))
        var xmin = Math.min.apply(Math, data.map(function (o) {
            return o.date;
        }))

        //remove previous contents
        document.getElementById("lineGraph-div").innerHTML = "";

        // set the dimensions and margins of the graph
        var margin = {
            top: 10,
            right: 50,
            bottom: 10,
            left: 50
        },
            width = 325 - margin.left - margin.right,
            height = 220 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#lineGraph-div")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 300 250")
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
        .domain([xmin - xmin / 1000, xmax + xmax / 1000])
        .range([0, width]);


        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axisWhite")
            .call(d3.axisBottom(x).tickSize(0))
            .selectAll("text").remove()

        // text label for the x axis
        svg.append("text")
            .attr("transform",
                  "translate(" + (width/2) + " ," +
                  (height + margin.top + 10) + ")")
            .attr("fill", "white")
            .style("text-anchor", "middle")
            .style("font", "11px verdana")
            .text("Time");

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([ymin - 10, ymax + 10])
        .range([height, 0]);

        svg.append("g")
            .attr("class", "axisWhite")
            .call(d3.axisLeft(y).tickSizeOuter(0));

        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left - 95)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .attr("fill", "white")
            .style("text-anchor", "middle")
            .style("font", "11px verdana")
            .text("Wind Speed (kts)");

        // Add the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("class", "axisWhite")
            .attr("stroke-width", 1.25)
            .attr("d", d3.line()
                  .curve(d3.curveBasis) // Just add that to have a curve instead of segments
                  .x(function (d) {
            return x(d.date)
        })
                  .y(function (d) {
            return y(d.value)
        })
                 )


        // Add a tooltip div
        var tooltipLineGraph = d3.select("body")
        .append("div")
        .attr("class", "tooltipLineGraph")
        .style("display", "none");

        // A function that change this tooltip when the user hover a point
        var mouseover = function(d) {
            d3.select(this).attr("r", 3.5).style("fill", "red");
            tooltipLineGraph
                .style("display", "inline");
        }

        var mousemove = function (d) {

            tooltipLineGraph
                .html("<p style='font-size:12px;margin=0;padding=0;'>" +
                      "<b>Date:</b>&nbsp" + d.y + "-" + d.month + "-" + d.day + "&nbsp&nbsp" + d.hour + ":00" + " UTC<br>"
                      + "<b>Wind:</b>&nbsp" + d.value + " kts</p>")
                .style("left", (d3.event.pageX - 150) + "px")
                .style("top", (d3.event.pageY - 70) + "px");
        }

        // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        var mouseleave = function (d) {
            d3.select(this).attr("r", 2.5).style("fill", "#69b3a2");

            tooltipLineGraph
                .transition()
                .duration(200)
                .style("display", "none");
        }

        // Add the points
        svg
            .append("g")
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "myCircle")
            .attr("cx", function(d) {
            return x(d.date)
        })
            .attr("cy", function(d) {
            return y(d.value)
        })
            .attr("r", 2.5)
            .style("fill", "#69b3a2")
            .style("opacity", 0.8)
            .style("stroke", "white")
            .style("stroke-width", 1)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    }
    catch(err){
        $('#lineGraphTitle').html("Individual Hurricane Info");
    }
}


function handleChange(){
    var optValue = document.querySelector('input[name=option]:checked').value;
    var checkboxes = document.getElementsByName('category');

    if (optValue == 'o1') {

        document.getElementById("hurricaneInput").disabled = false;

        for(var i=0, n=checkboxes.length; i < n; i++) {
            checkboxes[i].disabled = true;
        }

        document.getElementById("locationInput").disabled = true;
        document.getElementById("locationInput").value = "";
        document.getElementById("locationInput").placeholder="Select a state or city";
        document.getElementById("yearInputMin").disabled = true;
        document.getElementById("yearInputMax").disabled = true;
    }
    else{
        for(i=0, n=checkboxes.length; i < n; i++) {
            checkboxes[i].disabled = false;
        }
        document.getElementById("yearInputMin").disabled = false;
        document.getElementById("yearInputMax").disabled = false;
        document.getElementById("locationInput").disabled = false;
        document.getElementById("hurricaneInput").disabled = true;
        document.getElementById("hurricaneInput").value = "";
        document.getElementById("hurricaneInput").placeholder="Select one hurricane by name";
    }
}

$(document).ready(createMap);
