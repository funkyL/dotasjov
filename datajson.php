<?php
$start = time();
require 'vendor/autoload.php';
require './simple_html_dom.php';
$dota_version = "7.07c";

use GuzzleHttp\Client;


function http_call($endpoint){
  // Simple function for calling dotabuff server. Returns str containing source code.
  $userAgent = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:54.0) Gecko/20100101 Firefox/54.0';
  $referer = 'https://www.dotabuff.com/';

  $client = new Client([
    'base_uri' => 'https://www.dotabuff.com/',
    'timeout' => 10.0,
  ]);
  $response = $client->request(
    'GET',
    $endpoint,
    ['headers' => [
      'Referer' => $referer,
      'User-Agent' => $userAgent
      ]
    ]
  );
  return $response->getBody();
}

function get_heroes(){
  // Returns a list of all heroes. Calls dotabuff /heroes page to make
  // an array with id names and pretty names e.g. "Arc Warden"=>"arc-warden".

  // call dotabuff
  $heroes_html = str_get_html(http_call('heroes'));
  $heroes = array();
  foreach ($heroes_html->find('div.hero-grid a') as $hero){

    $hero_img_url = $hero->find('div.hero',0)->style;
    $prettyName = $hero->find('div.name',0)->plaintext;
    $heroName = fix_name($prettyName);
    $heroes[$heroName] = [$prettyName, fix_img_url($hero_img_url)];
  }
  return $heroes;
}

function fecth_hero_matchup($hero){


  // call dotabuff
  $endpoint = 'heroes/'.$hero.'/matchups?date=patch_'.$GLOBALS['dota_version'];
  $html = str_get_html(http_call($endpoint));

  $matchups = array(); // container array for matchup advantages
  foreach($html->find('div.content-inner tr[data-link-to]') as $row) {

    // set hero name
    $prettyName = $row->find('td', 1)->plaintext;
    $heroName = fix_name($prettyName); //set string to all lowercase and replaces spaces with a dash(-).

    // set advantage
    $hero_advantage = $row->find('td',2)->plaintext;
    $hero_advantage = str_replace('%','',$hero_advantage);

    // assign values to $matchups
    $matchups[$heroName] = 0 + $hero_advantage;
    //echo $hero_name.' '.$hero_advantage.'<br/>';
  }
  return $matchups; //returns array containing matchups for given $hero
}

function fix_name($name){
  return strtolower(str_replace('\'', '',str_replace(' ', '-', str_replace("&#39;", "",$name))));
}
function fix_img_url($fixme){
  return "https://www.dotabuff.com".str_replace('&#47;','/',substr($fixme, 16, -1));
}

function write_file($content, $filepath){
  $fp = fopen($filepath, 'w');
  fwrite($fp, $content);
  fclose($fp);
}



// Execution
echo "Retreiving hero list..\n";
$heroes = get_heroes();
$matchups = array();
echo "Downloading hero matchups:\n";
foreach ($heroes as $k => $v){
  echo '..'.$k."\n";
  $matchup = fecth_hero_matchup($k);
  $matchups[$k] = $matchup;
}

$result = [
  'update-timestamp' => $start, // unix timestamp
  'dota-version' => $dota_version,
  'heroes' => $heroes,
  'matchups' => $matchups
];

$json_result = json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
echo "Writing json to file!\n";
write_file($json_result, './data.json');

echo 'Finished in '.(time() - $start)."seconds\n";
?>
