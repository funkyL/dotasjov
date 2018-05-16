//import * as jsonFile from 'http://localhost/dotasjov/data2.json';
var dataURL = '../data/data.json';

var app = new Vue({
  el: '#app',
  data: {
    heroes: null,
    matchups: null,
    selected: [],
    advantages: {},
    adv_sorted: []
  },

  created: function() {
    this.fetchData();
  },
  watch: {
    selected: function() {
      for (adv_hero in this.heroes){
        var result = 100;
        for (n in this.selected){
          var sel_hero = this.selected[n];
          result += this.matchups[sel_hero][adv_hero];
        };
        this.advantages[adv_hero]['adv'] = result;
      };
      this.adv_sorted = _.orderBy(this.advantages, ['adv','name'], ['desc','asc'])
    }
  },
  methods: {
    fetchData: function () {
      this.$http.get( dataURL).then(response => {
        this.heroes = response.body.heroes;
        this.matchups = response.body.matchups;
        for (hero in this.heroes) {
          this.advantages[hero] = { hero: hero, name: this.heroes[hero][0], adv: (Math.random()*10).toFixed(0)};
        };
      })
    },

    toggleSelect: function(key) {
      if (!this.selected.includes(key) && this.selected.length < 5) {
        this.selected.push(key);
      }
      else if (this.selected.includes(key)) {
        var index = this.selected.indexOf(key);
        this.selected.splice(index, 1);
      }
      return;
    },
    imgSrc(hero, db=0){
      if (db) { return this.heroes[hero][1] }
      else {return "../img/" + hero + ".jpg"}
    }
  }
});
