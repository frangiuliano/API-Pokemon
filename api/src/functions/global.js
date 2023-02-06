const { Pokemon, Types } = require("../db");
const axios = require("axios");

async function getApiInfo() {
  try {
    const apiInfo = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=40"
    );
    const apiURL = apiInfo.data.results.map(
      async (e) => await axios.get(e.url)
    );
    const pokeInfo = await axios.all(apiURL).then((resp) =>
      resp.map((p) => {
        return {
          id: p.data.id,
          name: p.data.name,
          hp: p.data.stats[0].base_stat,
          attack: p.data.stats[1].base_stat,
          defense: p.data.stats[2].base_stat,
          speed: p.data.stats[5].base_stat,
          height: p.data.height,
          weight: p.data.weight,
          types: p.data.types.map((tp) => tp.type.name),
          image: p.data.sprites.other.home.front_default,
        };
      })
    );
    return (globalThis.pokeData = pokeInfo);
  } catch (error) {
    console.log(error);
  }
}
getApiInfo();

async function getDBInfo() {
  try {
    const infoDB = await Pokemon.findAll({
      include: {
        model: Types,
        attributes: ["name"],
        through: { attributes: [] },
      },
    });
    const dataLimpia = JSON.parse(JSON.stringify(infoDB, null, 2));

    dataLimpia.forEach(
      (poke) => (poke.types = poke.types.map((tp) => tp.name))
    );
    return dataLimpia;
  } catch (error) {
    console.log(error);
  }
}

async function getAllPokemons() {
  const getAllApiInfo = pokeData;
  const getAllDBInfo = await getDBInfo();
  const getAllinfo = [...getAllApiInfo, ...getAllDBInfo];
  return getAllinfo;
}

module.exports = {
  getAllPokemons,
};
