import { Dex } from '@pkmn/dex';
import StringHelper from './stringUtils.js';
import { pokemon, typeHex, smogonFormats } from '../data/module.js';
import { Sprites } from '@pkmn/img';
import axios from 'axios';
import Fuse from 'fuse.js';
import { Koffing } from 'koffing';
import * as cheerio from 'cheerio';

const pokeFuse = new Fuse(pokemon, { threshold: 0.4 });
const formatFuse = new Fuse(smogonFormats, { threshold: 0.6 });

const parsePokepaste = async (link) => {
  try {
    const markup = await axios.get(link);
    const $ = cheerio.load(markup.data);
    const parsedTeam = $('pre').text();

    return Koffing.parse(parsedTeam);
  } catch (err) {
    throw new Error('Invalid Link Given' + err);
  }
};

const returnPokemonType = (pokemon) => {
  return Dex.species.get(pokemon).types;
};

const cleanPokemonName = (nameString) => {
  let pokemon = Dex.species.get(nameString);
  if (pokemon.exists) return pokemon.name;

  const result = pokeFuse.search(nameString).slice(0, 2);
  (result[0]['item'].includes('mega') && !nameString.includes('mega'))
    ? (pokemon = Dex.species.get(result[1]['item']))
    : (pokemon = Dex.species.get(result[0]['item']));
  return pokemon.name;
};

const fetchPokemonSprite = (pokemon, gen) => {
  const sprite = Sprites.getPokemon(pokemon, { gen }); 
  return sprite.url;
};

const autoCompletePokemon = async (interaction) => {
  const focusedOption = interaction.options.getFocused(true);
  const substring = focusedOption.value.toLowerCase();
  let choices = pokeFuse.search(substring).map((choice) => choice.item);
  choices = choices.slice(0, 24);
  await interaction.respond(
    choices.map((choice) => ({
      name: StringHelper.capitalizeTheFirstLetterOfEachWord(choice),
      value: StringHelper.capitalizeTheFirstLetterOfEachWord(choice),
    }))
  );
};

const buildRandomTeam = (type, gen, format) => {
  const sprites = Sprites.getPokemon(type, { gen }, { format: 'OU' });
  const allPokemon = Dex.species.all();
  const format = Dex.formats.get(format);
  const formatData = Dex.formatsData;


  // logic for buildng OU team
  const filtered = allPokemon.filter(poke => {
    if (poke.gen > gen) return false;
    if (!poke.baseStats) return false;
    if (!poke.types.includes(type)) return false;
    if (poke.isNonstandard) return false;

  // for gen9 OU
    const bannedForms = ['-Totem', '-Gmax', '-Mega']
    if (bannedForms.some(form => poke.name.includes(form))) return false;

       const speciesFormatData = Dex.formatsData[poke.id];
    if (!speciesFormatData) return false;
    const allowedTiers = ['OU', 'UU', 'RU', 'NU', 'PU', 'ZU'];
    if (!allowedTiers.includes(speciesFormatData.tier)) return false;

    // Banlist check
    if (format.banlist.includes(poke.name)) return false;

    return true;
  });

  const team = [];
  while (team.length < 6 && filtered.length > 0, i++) {
    const randomIndex = Math.floor(Math.random() * filtered.length);
    team.push(filtered[randomIndex]);
    filtered.splice(randomIndex, 1);
  }

  return team;
};

const autoCompleteFormat = async (interaction) => {
  const focusedOption = interaction.options.getFocused(true);
  const substring = focusedOption.value.toLowerCase();
  let choices = formatFuse.search(substring).map((choice) => choice.item);
  choices = choices.slice(0, 24);
  console.log(choices);
  await interaction.respond(
    choices.map((choice) => ({
      name: choice,
      value: choice,
    }))
  );
};

const cleanFormat = (format) => {
  return formatFuse.search(format).map((choice) => choice.item)[0];
};

const fetchTypeHex = (pokemon) => {
  const types = returnPokemonType(pokemon);
  return typeHex.get(types[0]);
};

const classifyPokemon = (evs, nature) => {
  const statNames = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
  const evStats = statNames.map((stat) => ({ stat, value: evs[stat.toLowerCase()] || 0 }));

  evStats.sort((a, b) => b.value - a.value);

  const topStats = evStats.slice(0, 2).map((statObj) => statObj.stat).sort();

  const classificationLookup = {
    AtkSpe: 'Fast Physical Attacker',
    SpASpe: 'Fast Special Attacker',
    HPSpD: 'Special Wall',
    HPDef: 'Physical Wall',
  };

  const classificationKey = topStats.join('');
  const classification = classificationLookup[classificationKey] || 'Mixed';

  return classification;
};

export {
    returnPokemonType,
    autoCompletePokemon,
    parsePokepaste,
    fetchPokemonSprite,
    fetchTypeHex,
 	StringHelper,
  	cleanPokemonName,
  	autoCompleteFormat,
  	cleanFormat,
  	classifyPokemon,
  	cheerio
};
