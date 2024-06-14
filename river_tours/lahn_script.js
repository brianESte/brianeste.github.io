// price_schema: adult, child, dog, shuttle, 
// boat_prices: K1, K2, K3, C2, C3, C4, C5

const dot_product = (a, b) => a.map((el, i) => el*b[i]).reduce((c, d) => c+d);

const river_color = "#00a9ff";
const river_highlight = "#005eff";

// set map_svg to undefined until it is loaded in
var map_svg = undefined;
window.addEventListener("load", () => {
	map_svg = document.getElementById("lahn_map").contentDocument;
	console.log(map_svg);
});

var kv_list = {
  "Lahn Kanu": {
    abbreviation: "LK",
    boat_prices: [5, 0, 0, 0, 0, 0, 0],
    group_prices: [37, 35, 5],
    shuttle: null,
    tours: [
      { name: "Tour de Natur", num: 0, dist: "14", starttime: "09:00", flex: false, sections: [2, 2]},
      { name: "Bootsrutschen-Tour", num: 1, dist: "18", starttime: "09:15", flex: false, sections: [4, 2] },
      { name: "KulTour", num: 2, dist: "8", starttime: "10:15", flex: false, sections: [5, 1] },
      { name: "Kormoran-Tour", num: 3, dist: "18", starttime: "09:30", flex: false, sections: [5, 3] },
      { name: "Blässhuhn-Tour", num: 4, dist: "13", starttime: "10:45", flex: false, sections: [6, 2] },
      { name: "Kurz & Knackig", num: 5, dist: "6", starttime: "10:00 / 14:30", flex: false, sections: [7, 1] },
      { name: "Kleine Stockenten-Tour", num: 6, dist: "10", starttime: "10:45", flex: false, sections: [6, 2] },
      { name: "Große Stockenten-Tour", num: 7, dist: "23", starttime: "08:45", flex: false, sections: [6, 4] },
      { name: "Kleine Eisvogel-Tour", num: 8, dist: "13", starttime: "11:30", flex: false, sections: [8, 2] },
      { name: "Große Eisvogel-Tour", num: 9, dist: "16", starttime: "10:00", flex: false, sections: [8, 3] },
      { name: "Tunnel- & Schleussen-Tour", num: 10, dist: "15-26", starttime: "11:30", flex: true, sections: [11, 4] }
    ]
  },
  "Lahn Tours": {
    abbreviation: "LT",
    boat_prices: [5, 0, 0, 0, 0, 0, 0],
    group_prices: [26, 19.5, 0],
    shuttle: 6,
    tours: [
      { name: "Der Natur ganz nah", num: 0, dist: 16, starttime: "10:00", flex: false, sections: [1, 2] },
      { name: "Facettenreich - Etwas für jedermann", num: 1, dist: 17, starttime: "09:30", flex: false, sections: [5, 3] },
      { name: "Sprudelnde Lahn", num: 2, dist: 15, starttime: "10:30", flex: false, sections: [8, 3] },
      { name: "Abwechslungsreiche Herausforderung", num: 3, dist: 28, starttime: "09:30", flex: false, sections: [11, 5] },
      { name: "Viele Eindrücke - Tunnel und Schleusen", num: 4, dist: 16, starttime: "11:00", flex: false, sections: [11, 4] },
      { name: "Landschaft und Geschichte", num: 5, dist: 18, starttime: "10:00", flex: false, sections: [17, 3] },
      { name: "Klein aber Fein!", num: 6, dist: 8, starttime: "11:00 / 14:30", flex: false, sections: [1, 1] },
      { name: "Entspannt genießen", num: 7, dist: 11, starttime: "12:00", flex: false, sections: [6, 2] },
      { name: "Der Familien Klassiker", num: 8, dist: 12, starttime: "12:00 / 14:00", flex: false, sections: [15, 2] },
      { name: "Die kurze Auszeit", num: 9, dist: 10, starttime: "11:00 / 15:00", flex: false, sections: [17, 2] }
    ]
  },
  "Kanuverleih-Oberlahn": {
    abbreviation: "KV-OL",
    boat_prices: [35, 45, 65, 45, 65, 80, 85],
    group_prices: [0, 0, 0],
    shuttle: null,
    tours: [
      { name: "Hausstrecke mit Schiffstunnel Weilburg", num: 0, dist: "3.4-28.9", starttime: "09:00 - 13:00", flex: true, sections: [10, 7] },
      { name: "Ab Leun bis Gräveneck", num: 1, dist: "12.1-26.6", starttime: "10:00", flex: true, sections: [9, 4] },
      { name: "Ab Fürfurt bis Limburg", num: 2, dist: "3.4-24.9", starttime: "11:00", flex: true, sections: [14, 5] },
      { name: "Ab Villmar bis Diez", num: 3, dist: "2.7-19.8", starttime: "11:30", flex: true, sections: [16, 4] },
      { name: "Ab Runkel bis Balduinstein", num: 4, dist: "6.5-25.9", starttime: "13:00", flex: true, sections: [17, 4] },
    ]
  }
};

var state = {
  // n_adults: 1, n_children: 0, n_dogs: 0, 
  group_cts: [1, 0, 0],
  // n_K1: 0, n_K2: 0, n_C3: 0,
  boat_cts: [0, 0, 0, 0, 0, 0, 0],
  KV: "Lahn Kanu",
  tour_num: 0,
  starttime: null,
  cost: 0
};

function handle_group_change(self){
  // update the state
  var [key, index] = self.name.split('-');

  state[key][index] = parseInt(self.value);
  // then update cost
  update_cost();
}

function update_cost(){
  state.cost = dot_product(kv_list[state.KV].group_prices, state.group_cts) + dot_product(kv_list[state.KV].boat_prices, state.boat_cts);
  if(isNaN(state.cost)){
    console.log("bruh");
    console.log()
  }
  document.getElementById("tour_cost").innerText = state.cost;
}

function handle_tour_click(self){
  // clear previous river section
  var [sec_start, n_sections] = kv_list[state.KV].tours[state.tour_num].sections;
  for(let i = sec_start; i < sec_start+n_sections; i++){
    map_svg.getElementById("section_"+i).style.stroke = river_color;
    map_svg.getElementById("section_"+i).style.strokeDasharray = "none";
  }

  // update state
  var [_, KV, num] = self.attributes.for.nodeValue.split('_');
  state = {...state, KV: KV, tour_num: num, starttime: kv_list[KV].tours[num].starttime};
  $("#tour_starttime").text(state.starttime);
  $("#tour_dist").text(kv_list[KV].tours[num].dist);
          
  // set new sections to highlighted color
  [sec_start, n_sections] = kv_list[KV].tours[num].sections;
  const dash_style = kv_list[KV].tours[num].flex ? "10 20" : "none";
  map_svg.getElementById("section_"+sec_start).style.stroke = river_highlight;
  for(let i = sec_start+1; i < sec_start+n_sections; i++){
    map_svg.getElementById("section_"+i).style.stroke = river_highlight;
    map_svg.getElementById("section_"+i).style.strokeDasharray = dash_style;
  }

  update_cost();
}

for(let KV in kv_list){
  let kv_tours = kv_list[KV].tours;
  for(let tour of kv_tours){
    let name = kv_list[KV].abbreviation+": "+tour.name;
    let el_for ='ts_'+KV+'_'+tour.num;
    $("#tour_list").append($("<li>")
      .append($("<input>", {"name": "tour", "id": "ts_"+KV+"_"+tour.num, "type": "radio"}))
      .append($("<label for='"+el_for+"' onclick='handle_tour_click(this)'>"+name+"</label>"))
    )
  }
}
