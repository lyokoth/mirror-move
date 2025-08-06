import { Dex } from '@pkmn/dex';
import { StringHelper } from './stringUtils.js';
import { pokemon, typeHex, smogonFormats } from '../data/module.js';
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
  const sprite = Dex.sprites.getPokemon(pokemon, { gen }); // fixed typo: was "sprite.getPokemon"
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
