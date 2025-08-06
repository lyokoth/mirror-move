import Table from 'easy-table';
import { Dex } from '@pkmn/dex';
import { Generations } from '@pkmn/data';
import { returnPokemonType } from './pokeUtils.js';
import { emojiString } from '../data/module.js';


const fetchTeamWeaknessTable = (team) => {
	const tableData = [
		{ type: 'Bug', weakTo: true },
		{ type: 'Dark', weakTo: true },
		{ type: 'Dragon', weakTo: true },
		{ type: 'Electric', weakTo: true },
		{ type: 'Fairy', weakTo: true },
		{ type: 'Fighting', weakTo: true },
		{ type: 'Fire', weakTo: true },
		{ type: 'Flying', weakTo: true },
		{ type: 'Ghost', weakTo: true },
		{ type: 'Grass', weakTo: true },
		{ type: 'Ground', weakTo: true },
		{ type: 'Ice', weakTo: true },
		{ type: 'Normal', weakTo: true },
		{ type: 'Poison', weakTo: true },
		{ type: 'Psychic', weakTo: true },
		{ type: 'Rock', weakTo: true },
		{ type: 'Steel', weakTo: true },
		{ type: 'Water', weakTo: true },
	];

    // not effective 
	tableData.forEach(value => {
		team.forEach(pokemon => {
			const gens = new Generations(Dex);
			const types = returnPokemonType(pokemon.name);
			const num = gens.get(9).types.totalEffectiveness(value.type, types);
			if (num === 0.5 || num === 0.25 || num === 0) {
				value.weakTo = false;
			}
		});
	});

	return tableData;
};

const printTeamWeaknessTable = (team) => {
	const table = fetchTeamWeaknessTable(team);
	let returnString = '';

	table.forEach(value => {
		if (value.weakTo) {
			returnString += value.type + ' ';
		}
	});

	if (returnString.length === 0) returnString = 'Your team has no obvious type weaknesses!';

	return '```' + returnString + '```';
};

const fetchPokemonWeaknessTable = (pokemon) => {
	const gens = new Generations(Dex);
	const types = returnPokemonType(pokemon);

	const tableData = [
		{ type: 'Bug', effectivess: 0 },
		{ type: 'Dark', effectivess: 0 },
		{ type: 'Dragon', effectivess: 0 },
		{ type: 'Electric', effectivess: 0 },
		{ type: 'Fairy', effectivess: 0 },
		{ type: 'Fighting', effectivess: 0 },
		{ type: 'Fire', effectivess: 0 },
		{ type: 'Flying', effectivess: 0 },
		{ type: 'Ghost', effectivess: 0 },
		{ type: 'Grass', effectivess: 0 },
		{ type: 'Ground', effectivess: 0 },
		{ type: 'Ice', effectivess: 0 },
		{ type: 'Normal', effectivess: 0 },
		{ type: 'Poison', effectivess: 0 },
		{ type: 'Psychic', effectivess: 0 },
		{ type: 'Rock', effectivess: 0 },
		{ type: 'Steel', effectivess: 0 },
		{ type: 'Water', effectivess: 0 },
	];

	tableData.forEach(value => {
		const num = gens.get(9).types.totalEffectiveness(value.type, types);
		switch (num) {
		case 0:
			value.effectivess = 'immune';
			break;
		default:
			value.effectivess = `${num}x`;
			break;
		}
	});

	return tableData;
};

const printPokemonWeaknessTable = (pokemon) => {
	const table = fetchPokemonWeaknessTable(pokemon);
	const t = new Table;
	const types = returnPokemonType(pokemon);

	table.forEach((type) => {
		if (type.effectivess != '1x') {
			t.cell('Type', type.type);
			t.cell('Modify', type.effectivess);
			t.newRow();
		}
	});

	let returnString = '';

	returnString += emojiString(types);

	return returnString + '\n```' + t.toString() + '```';
};

export {
	fetchTeamWeaknessTable,
	printTeamWeaknessTable,
	fetchPokemonWeaknessTable,
	printPokemonWeaknessTable };