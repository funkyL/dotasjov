var dataURL = '../data/data.json';

var app = new Vue({
  el: '#app',
  data: {
		heroes: null, // list of all hereos, with id and pretty name
		heroeCounters: null, // all the counters(disadvantage) numbers.
		side: {'team1': [], 'team2': []},
		totalCountersT2: {}, // accumulated numbers for matchup against T2
		totalCountersT2_sorted: null,
		singleTotalMatchup: {'team1':{}, 'team2': {}},
		countersT1: {},
		sortOrder: { 'first': ['adv','name'], 'second': ['desc','asc']}

  },

  created: function() {
    this.fetchData();
		this.sortList();
  },

  watch: {
		side: function() {
			this.updateTotalCountersT2();
			this.totalHeroMatchupT1();
		}
  },

  methods: {
		fetchData: function () {
      this.$http.get( dataURL).then(response => {
        this.heroes = response.body.heroes;
        this.heroCounters = response.body.matchups;
				for (hero in this.heroes) {
					this.totalCountersT2[hero] = { hero: hero, name: this.heroes[hero][0], adv: (Math.random()*10).toFixed(0)};
				};
      })
    },
		imgSrc(hero, db=0){
			if (db) { return this.heroes[hero][1] }
		  else {return "../img/" + hero + ".jpg"}
		},
		select: function(key, team) {
			switch (team) {
				case "t1":
		      if (!this.side['team1'].includes(key) && this.side['team1'].length < 5) {
		        this.side['team1'].push(key);
		      }
					break;
				case "t2":
		      if (!this.side['team2'].includes(key) && this.side['team2'].length < 5) {
		        this.side['team2'].push(key);
					}
					break;
				}
				this.updateTotalCountersT2();
      return;
    },
		deselect: function(key) {
			if (this.side['team1'].includes(key)) {
				var index = this.side['team1'].indexOf(key);
				this.side['team1'].splice(index, 1);
			}
			else if (this.side['team2'].includes(key)) {
				var index = this.side['team2'].indexOf(key);
				this.side['team2'].splice(index, 1);
			}
			this.updateTotalCountersT2();
		},
		isNotSelected: function (hero) {
			if (this.side['team1'].includes(hero) || this.side['team2'].includes(hero)) {
				return true;
			}
			else return false;
		},
		updateTotalCountersT2: function () {
			for (hero_id in this.heroes){
				var result = 100;
				for (n in this.side['team2']){
					var sel_hero = this.side['team2'][n];
					result += this.heroCounters[sel_hero][hero_id];
				};
				this.totalCountersT2[hero_id]['adv'] = result;
			};
		},
		sortList: function() {
			this.totalCountersT2_sorted = _.orderBy(this.totalCountersT2, this.sortOrder['first'], this.sortOrder['second']);
		},
		singleMatchup: function (herot1, herot2) {
			if (this.side['team2'].length >= herot2+1 && this.side['team1'].length >= herot1+1){
				return this.heroCounters[this.side['team2'][herot2]][this.side['team1'][herot1]];
			}
			else return " - ";
		},
		totalHeroMatchupT1: function () {
			this.singleTotalMatchup['team1'] = {0 : " - ", 1: " 0 ", 2: " - ", 3: " - ", 4: " - "};
			var c = 0;
			for (idx in heroesT1){
				this.singleTotalMatchup['team1'][c] = this.totalCountersT2[idx]['adv'];
			}
		},
		prettyNumber: function( number ) {
			return (number - 100).toFixed(2);
		}
  }
});
