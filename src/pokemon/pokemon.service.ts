import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      console.log('createPokemonDto', createPokemonDto);

      return pokemon;
    } catch (e) {
      this.handleException(e);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }


  async findOne(id: string) {
    // Si es un ObjectId válido, buscamos por _id
    if (isValidObjectId(id)) {
      const pokemon = await this.pokemonModel.findById(id);
      if (!pokemon) {
        throw new NotFoundException(`Pokemon with id ${id} not found`);
      }
      return pokemon;
    }

    // Si es un número válido, buscamos por 'no' (número del Pokémon)
    if (!isNaN(Number(id))) {
      const pokemon = await this.pokemonModel.findOne({ no: id });
      if (!pokemon) {
        throw new NotFoundException(`Pokemon with id ${id} not found`);
      }
      return pokemon;
    }

    // Si no es un número ni un ObjectId, buscamos por 'name'
    const pokemon = await this.pokemonModel.findOne({ name: id });
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with name ${id} not found`);
    }

    return pokemon;
  }



  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(term);
      if (updatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };

    } catch (e) {
      this.handleException(e);
    }

  }

  async remove(id: string) {

    const {deletedCount} = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id ${id} not found`);
    }
    return;
  }

  private handleException(e: any) {
    if (e.code === 11000) {
      throw new BadRequestException(`Pokemon wexits in db ${JSON.stringify(e.keyValue)}`);
    }
    console.log('e', e);
    throw new InternalServerErrorException(`can't create pokemon `);
  }
}
