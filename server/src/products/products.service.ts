import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  create(dto: Partial<Product>) {
    const p = this.repo.create(dto);
    return this.repo.save(p);
  }

  update(id: number, dto: Partial<Product>) {
    return this.repo.update(id, dto);
  }

  delete(id: number) {
    return this.repo.delete(id);
  }

  findAll(q?: string) {
    if (q) return this.repo.find({ where: [{ title: Like(`%${q}%`) }, { description: Like(`%${q}%`) }]});
    return this.repo.find();
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id }});
  }
}
