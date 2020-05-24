
$(document).ready(function(){
    var _STOP_CITY = ['Paris', 'Strasbourg', 'Colmar', 'Sacy', 'Les Trois-Domaines', 'Forbach-Boulay-Moselle', 'Metz', 'Thionville', 'Lyon', 'Lyon', 'Torcy', 'Chessy', 'Nancy', 'Mulhouse', 'Meroux-Moval', 'Les Auxons', 'Dijon', 'Mâcon', 'Nîmes', 'Montpellier', 'Avignon', 'Cabriès', 'Marseille', 'Chalon-sur-Saône', 'Alixan', 'Beaune', 'Nice', 'Antibes', 'Cannes', 'Saint-Raphaël', 'Les Arcs-sur-Argens', 'Toulon', 'Remiremont', 'Épinal', 'Saint-Dié-des-Vosges', 'Lunéville', 'Saverne', 'Sarrebourg', 'Châlons-en-Champagne', 'Vitry-le-François', 'Bar-le-Duc', 'Reims', 'Rethel', 'Charleville-Mézières', 'Sedan', 'Lille', 'Ablaincourt-Pressoir', 'Roissy-en-France', 'Arras', 'Redessan', 'Montpellier', 'Sète', 'Agde', 'Béziers', 'Narbonne', 'Perpignan', 'Lille', 'Montbard', 'Douai', 'Massy', 'Saint-Pierre-des-Corps', 'Poitiers', 'Angoulême', 'Bordeaux', 'Le Mans', 'Angers', 'Nantes', 'Rennes', 'Laval', 'Le Havre', 'Rouen', 'Mantes-la-Jolie', 'Versailles', 'Massy', 'Saumur', 'Louvigny', 'Paris', 'Hyères', 'Colombier-Saugnieu', 'Menton', 'Valence', 'Montélimar', 'Orange', 'Avignon', 'Miramas', 'Mâcon', 'Bourg-en-Bresse', 'Chambéry', 'Valserhône', 'Annemasse', 'Thonon-les-Bains', 'Évian-les-Bains', 'Saint-Jean-de-Maurienne', 'Modane', 'Saint-Étienne', 'Dole', 'Besançon', 'Carcassonne', 'Toulouse', 'Grenoble', 'Aix-les-Bains', 'Annecy', 'Paris', 'Fréthun', 'Boulogne-sur-Mer', 'Calais', 'Dunkerque', 'Lens', 'Béthune', 'Hazebrouck', 'Étaples', 'Verton', 'Wasquehal', 'Roubaix', 'Tourcoing', 'Valenciennes', 'Paris', 'Agen', 'Montauban', 'Saint-Brieuc', 'Guingamp', 'Morlaix', 'Brest', 'Lamballe-Armor', 'Plouaret', 'Landerneau', 'Redon', 'Vannes', 'Auray', 'Lorient', 'Vitré', 'Quimper', 'Quimperlé', 'Rosporden', 'Saint-Malo', 'Dol-de-Bretagne', 'La Roche-sur-Yon', 'Saint-Nazaire', 'La Baule-Escoublac', 'Le Croisic', 'Pornichet', 'Le Pouliguen', 'Sablé-sur-Sarthe', "Les Sables-d\'Olonne", 'Biganos', 'Arcachon', 'La Teste-de-Buch', 'Libourne', 'Vendôme', 'Châtellerault', 'Dax', 'Bayonne', 'Biarritz', 'Saint-Jean-de-Luz', 'Hendaye', 'Niort', 'Surgères', 'La Rochelle', "Saint-Maixent-l\'École", 'Chasseneuil-du-Poitou', 'Tours', 'Orthez', 'Pau', 'Lourdes', 'Tarbes'];
    var _STOP_NAME = ['Paris-Est','Strasbourg','Colmar','Champagne-Ardenne','Meuse-TGV','Forbach','Metz-Ville','Thionville','Lyon-Perrache','Lyon-Part-Dieu','Creusot - TGV (le)','Marne-la-Vallée-Chessy.','Nancy-Ville','Mulhouse','Belfort-Montbéliard-TGV','Besançon-Franche-Comté','Dijon-Ville','Mâcon-Ville','Nîmes','Montpellier-Saint-Roch','Avignon-TGV','Aix-en-Provence-TGV','Marseille-St-Charles','Chalon-sur-Saône','Valence-TGV','Beaune','Nice-Ville','Antibes','Cannes','St-Raphael-Valescure','Les Arcs-Draguignan','Toulon','Remiremont','Epinal','St-Dié-des-Vosges','Lunéville','Saverne','Sarrebourg','Châlons-en-Champagne','Vitry-le-François','Bar-le-Duc','Reims','Rethel','Charleville-Mézières','Sedan','Lille Europe','TGV Haute-Picardie','Aéropt-C-de-Gaulle-TGV','Arras','NÃƒÂ®mes Pont-du-Gard','Montpellier-Sud-France','SÃƒÂ¨te','Agde','BÃƒÂ©ziers','Narbonne','Perpignan','Lille Flandres','Montbard','Douai','Massy-TGV','St-Pierre-des-Corps','Poitiers','AngoulÃƒÂªme','Bordeaux-St-Jean','Le Mans','Angers-St-Laud','Nantes','Rennes','Laval','Le Havre','Rouen-Rive-Droite','Mantes-la-Jolie','Versailles-Chantiers','Massy-Palaiseau','Saumur','Lorraine-TGV','Paris-Gare-de-Lyon','HyÃƒÂ¨res','Lyon-Saint-Exupery-Tgv','Menton','Valence-Ville','MontÃƒÂ©limar','Orange','Avignon-Centre','Miramas','Mâcon-Loché-TGV','Bourg-en-Bresse','Chambéry-Chal.-les-Eaux','Bellegarde-s-V. Gare','Annemasse','Thonon-les-Bains','Evian-les-Bains','St-Jean-de-Maurienne-A.','Modane','St-Etienne-Châteaucreux','Dole-Ville','Besançon-Viotte','Carcassonne','Toulouse-Matabiau','Grenoble','Aix-les-Bains-le-Revard','Annecy','Paris Gare du Nord','Calais Fréthun','Boulogne Ville','Calais Ville','Dunkerque','Lens','Béthune','Hazebrouck','Etaples Le Touquet','Rang du Fl. Verton Ber.','Croix Wasquehal','Roubaix','Tourcoing','Valenciennes','Paris-Montparnasse 1-2','Agen','Montauban-Ville-Bourbon','St-Brieuc','Guingamp','Morlaix','Brest','Lamballe','Plouaret-Trégor','Landerneau','Redon','Vannes','Auray','Lorient','Vitré','Quimper','Quimperlé','Rosporden','St-Malo','Dol','La Roche-sur-Yon','St-Nazaire','La Baule-Escoublac','Le Croisic','Pornichet','Le Pouliguen','Sablé-sur-Sarthe','Les Sables-d\'Olonne','Biganos-Facture','Arcachon','La Teste','Libourne','Vendôme-Villiers-s-Loir','Chatellerault','Dax','Bayonne','Biarritz','St-Jean-de-Luz-Ciboure','Hendaye','Niort','Surgères','La Rochelle-Ville','St-Maixent (Deux-Sèvr.)','Futuroscope','Tours','Orthez','Pau','Lourdes','Tarbes'];
    var _STOP_POS = [[2.35915061,48.87656977],[7.73396834,48.5851719],[7.34708413,48.07315381],[3.98878814,49.21164026],[5.27105413,48.97849058],[6.90184878,49.18949148],[6.17719829,49.10978742],[6.16885488,49.35392318],[4.82594103,45.74878519],[4.85943505,45.7605853],[4.49938814,46.76530905],[2.78287721,48.87059769],[6.17427169,48.68978225],[7.34284957,47.74179838],[6.89903128,47.58659149],[5.95475873,47.30747111],[5.02727989,47.32340388],[4.82514854,46.30265933],[4.36583551,43.83229306],[3.88236031,43.60583439],[4.78615444,43.92196386],[5.31726436,43.45515093],[5.38064989,43.30272986],[4.84348859,46.7815704],[4.97894146,44.99137044],[4.8487235,47.0230407],[7.26178618,43.70471069],[7.11951629,43.58578911],[7.01972542,43.55391311],[6.76901271,43.42360603],[6.48246201,43.45572852],[5.92945828,43.12831598],[6.59904066,48.01636734],[6.4415552,48.17807839],[6.94805613,48.28223818],[6.49703457,48.58799369],[7.36215238,48.74477891],[7.05278059,48.73794081],[4.34895439,48.9555093],[4.58723196,48.7177326],[5.16701612,48.77363051],[4.02401739,49.25906626],[4.37028428,49.50457068],[4.7248489,49.76742007],[4.92998882,49.69486091],[3.07574513,50.6388462],[2.83165428,49.85920132],[2.57158758,49.00401756],[2.78112647,50.28681562],[4.5076804,43.81680671],[3.92683548,43.59474378],[3.69639619,43.41281189],[3.46602019,43.31757369],[3.21921804,43.33622529],[3.00595633,43.19103322],[2.87961698,42.69607483],[3.07102315,50.63620117],[4.33615203,47.61871969],[3.08996131,50.37167529],[2.26156762,48.72602849],[0.72505388,47.38573204],[0.33308432,46.58218335],[0.16452848,45.65393498],[-0.55619406,44.82653979],[0.19214284,47.99558372],[-0.55694922,47.46443417],[-1.54192517,47.21750472],[-1.67232664,48.10351528],[-0.7609394900000001,48.07625188],[0.12483507,49.49265339],[1.09415392,49.44903033],[1.70329418,48.98968735],[2.13546496,48.79556635],[2.25659692,48.72490168],[-0.07142991999999999,47.268972],[6.16977576,48.94779465],[2.37346237,48.84492163],[6.12419901,43.1088605],[5.07583344,45.72092788],[7.49316896,43.77440045],[4.89329483,44.92807044],[4.74478967,44.55899966],[4.81949522,44.13730527],[4.80526228,43.94187716],[4.99960212,43.58074022],[4.77894838,46.28289775],[5.21496904,46.20012577],[5.91980053,45.57103797],[5.82364602,46.10970399],[6.23638776,46.19922998],[6.48155671,46.36897977],[6.57747248,46.39788911],[6.35419796,45.27784161],[6.65917769,45.19355829],[4.39999641,45.44338161],[5.48803607,47.09615509],[6.02191203,47.24703813],[2.35188313,43.2177147],[1.45355763,43.61146412],[5.71452957,45.1914627],[5.90934966,45.68786249],[6.12181945,45.90205904],[2.35488709,48.88013842],[1.81102746,50.9012626],[1.60980589,50.71558518],[1.85074515,50.95345613],[2.36894309,51.03043801],[2.82819533,50.42676563],[2.64039821,50.52143359],[2.54152631,50.72504307],[1.64249653,50.51671737],[1.64807751,50.41581001],[3.13809462,50.67854533],[3.16302118,50.69535226],[3.16800893,50.71672918],[3.5171157,50.3632371],[2.31989439,48.84062983],[0.6209045399999999,44.20797206],[1.34197365,44.01463933],[-2.76546663,48.50722302],[-3.14271633,48.55553565],[-3.83276143,48.5779789],[-4.47891795,48.38808306],[-2.51148941,48.46592233],[-3.46681,48.60618896],[-4.25620875,48.45383363],[-2.08787664,47.6517633],[-2.75252349,47.66532376],[-2.99999862,47.68018937],[-3.36634771,47.75520333],[-1.21196568,48.12241997],[-4.09210303,47.99465835],[-3.55301115,47.86906313],[-3.83275774,47.96018968],[-2.00462026,48.6466523],[-1.75046978,48.54297584],[-1.43568015,46.67202495],[-2.21107419,47.28647399],[-2.38922534,47.28862216],[-2.50728835,47.28988946],[-2.34473718,47.2704847],[-2.43315669,47.28252436],[-0.3420485,47.84171822],[-1.7811549,46.49998281],[-0.96602054,44.63748155],[-1.16536843,44.65891706],[-1.14297865,44.63695908],[-0.23636765,44.91588446],[1.01966733,47.8203239],[0.54921798,46.81856464],[-1.05032404,43.72066682],[-1.47039808,43.4967594],[-1.54601123,43.45937697],[-1.66116196,43.38584546],[-1.78186851,43.35299487],[-0.45439057,46.31934516],[-0.76213303,46.11341598],[-1.14530035,46.15270103],[-0.20130625,46.40630762],[0.37720187,46.66985027],[0.69350509,47.38981372],[-0.76762492,43.4840995],[-0.3696496,43.29166733],[-0.04219186,43.10042847],[0.06940671,43.23980288]];

    var stations_name = _STOP_CITY;
    var stations_pos = _STOP_POS;
    var map = L.map(
        "map",
        {
            center: [49.21164026, 3.98878814],
            crs: L.CRS.EPSG3857,
            zoom: 6,
            zoomControl: true,
            preferCanvas: false,
            scrollWheelZoom: false
        }
    );
    var tile_layer = L.tileLayer(
        "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
        {"attribution": "\u0026copy; \u003ca href=\"https://www.openstreetmap.org/copyright\"\u003eOpenStreetMap\u003c/a\u003e contributors \u0026copy; \u003ca href=\"https://carto.com/attributions\"\u003eCARTO\u003c/a\u003e", "detectRetina": false, "maxNativeZoom": 18, "maxZoom": 18, "minZoom": 0, "noWrap": false, "opacity": 1, "subdomains": "abc", "tms": false}
    ).addTo(map);

    var route = L.featureGroup().addTo(map)

    var markers = []
    function add_destination(name,position){
        var marker_destination = L.marker(
            [position[1],position[0]],
            {}
        );
        markers.push(marker_destination)
        var custom_icon = L.icon({"iconSize": [20, 20], "iconUrl":"img/placeholder.png"});
         marker_destination.setIcon(custom_icon);
        var popup = L.popup({"maxWidth": "100%"});
        var city = name.toLowerCase().replace(' ','_');
        var html = $('<a id="html_'+name+'" style="width: 100.0%; height: 100.0%;" href="destination?city='+city+'" target="_blank""><br>'+name+'<br></a>')[0];

        popup.setContent(html);
        marker_destination.bindPopup(popup);
        route.addLayer(marker_destination);
    }
    var destination_length = stations_name.length;
    for (var i = 0; i < destination_length; i++) {
        var name = stations_name[i].replace("\"","").replace("'","").replace("'","").replace(']','').replace('[','')
        console.log(name)
        console.log(stations_pos[i])
        add_destination(name,stations_pos[i])
    }


    map.fitBounds(route.getBounds());

});





