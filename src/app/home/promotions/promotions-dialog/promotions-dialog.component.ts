import { Promotions } from './../../../model/promotionitem';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { method } from 'src/app/model/model.model';
import { Products } from 'src/app/model/product';
import { stocklistproduct } from 'src/app/model/stock';
import { Stocks } from 'src/app/model/stockproduct';
import { environment } from 'src/environments/environment';
import { PromotionsComponent } from '../promotions.component';
import { Categorys } from 'src/app/model/category';
import { Types } from 'src/app/model/type';

@Component({
  selector: 'app-promotions-dialog',
  templateUrl: './promotions-dialog.component.html',
  styleUrls: ['./promotions-dialog.component.scss'],
})
export class PromotionsDialogComponent implements OnInit {
  promotionForm: FormGroup;
  addProductList: FormGroup;

  dataarray = [];
  header: string;
  promotionAdd = true;
  promotion: Promotions[] = [];
  addpromotion: Promotions;
  promotionitem: Promotionitem[] = [];
  categoryValueCheck = false;

  items: FormArray;
  productCheck = false;

  product: Products;
  products: Products[];
  productList: Products[];
  typeList: Types[];
  types: Types[];
  categoryList: Categorys;

  cateID: number;
  typeID: number;

  displayedColumns: string[] = ['product'];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PromotionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: method
  ) {}

  ngOnInit(): void {
    this.getProduct();
    this.getCategory();
    this.getType();
    this.initForm();

    if (this.data.method === 'addPromotion') {
      this.header = 'เพิ่มโปรโมชั่น';
      this.dataarray.push(this.promotion);
    } else if (this.data.method === 'editPromotion') {
      this.header = 'แก้ไขโปรโมชั่น';
      console.log(this.data.promotion);
      this.promotionForm.patchValue(this.data.promotion);

      this.items = this.promotionForm.controls.promotion_items as FormArray;

      for (const item of this.data.promotion.promotion_items) {
        this.items.push(this.createItem(item));
      }
    }
  }

  getProduct() {
    this.http
      .get(`${environment.apiUrl}products`)
      .subscribe((res: Products[]) => {
        this.products = res;
      });
  }

  getType(): void {
    this.http.get(`${environment.apiUrl}types`).subscribe((res: Types[]) => {
      this.types = res;
    });
  }

  getCategory(): void {
    this.http
      .get(`${environment.apiUrl}categories`)
      .subscribe((res: Categorys) => {
        this.categoryList = res;
      });
  }

  checkCateValue(event): void {
    this.cateID = event.value;
    if (event.value === 0) {
      this.categoryValueCheck = false;
      this.productList = this.products;
    } else {
      this.categoryValueCheck = true;

      this.typeList = this.types.filter((list) => {
        return list.category_id === event.value;
      });

      this.productList = this.products.filter((list) => {
        return list.category_id === event.value;
      });
    }
  }

  checkTypeValue(event, product: Products): void {
    this.typeID = event.value;
    if (event.value === 0) {
      this.productList = this.products.filter((list) => {
        return list.category_id === this.cateID;
      });
    } else {
      this.productList = this.products.filter((list) => {
        return list.type_id === this.typeID;
      });
    }
  }

  initForm(): void {
    this.promotionForm = this.fb.group({
      promotion_name: ['', Validators.required],
      promotion_discount: ['', Validators.required],
      date_start: ['', Validators.required],
      date_end: ['', Validators.required],
      promotion_items: this.fb.array([]),
    });

    this.addProductList = this.fb.group({
      addProduct_id: ['', Validators.required],
      addPromotion_item_amount: ['', Validators.required],
    });
  }

  createItem(data?: any): FormGroup {
    const result = this.fb.group({
      product_id: [
        this.addProductList.value.addProduct_id,
        Validators.required,
      ],
      promotion_item_amount: [
        this.addProductList.value.addPromotion_item_amount,
        Validators.required,
      ],
    });

    if (data) {
      result.patchValue(data);
    }

    return result;
  }

  addForm() {
    this.items = this.promotionForm.get('promotion_items') as FormArray;
    this.items.push(this.createItem());
  }

  removeForm(index) {
    this.items = this.promotionForm.get('promotion_items') as FormArray;
    this.items.removeAt(index);
  }

  onSubmit(): void {
    if (this.data.method === 'editPromotion') {
      if (this.promotionForm.invalid) {
        return;
      }
      const payload = this.promotionForm.value;

      console.log(payload);

      this.http
        .put(`${environment.apiUrl}promotions/` + this.data.promotion.id, {
          promotion: payload,
        })
        .subscribe((res) => {
          console.log(res);
          this.dialogRef.close();
        });
    }
    if (this.data.method === 'addPromotion') {
      if (this.promotionForm.invalid) {
        return;
      }

      const payload = this.promotionForm.value;
      console.log(payload);

      this.http
        .post(`${environment.apiUrl}promotions`, { promotion: payload })
        .subscribe((res) => {
          console.log(res);
          this.dialogRef.close();
        });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}

interface Promotionitem {
  product_id: number;
}