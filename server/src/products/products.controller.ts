import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { ProductsService } from "./products.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

@Controller("products")
export class ProductsController {
  constructor(private svc: ProductsService) {}

  @Get()
  async list(@Query("q") q?: string) {
    return this.svc.findAll(q);
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    return this.svc.findById(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Post()
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            extname(file.originalname);
          callback(null, uniqueName);
        },
      }),
    })
  )
  async create(@Body() dto: any, @UploadedFile() file?: Express.Multer.File) {
    if (file) dto.image = file.filename; // ✅ store only filename
    return this.svc.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Put(":id")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            extname(file.originalname);
          callback(null, uniqueName);
        },
      }),
    })
  )
  async update(
    @Param("id") id: string,
    @Body() dto: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) dto.image = file.filename; // ✅ same logic for consistency
    await this.svc.update(Number(id), dto);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.svc.delete(Number(id));
    return { success: true };
  }
}
