import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatComponentsModule } from '@app/mat-components/mat-components.module';
import { PurchaseOrder } from '@app/purchaseOrder/purchase-order';
import { PurchaseOrderItem } from '@app/purchaseOrder/purchase-order-item';
import { PurchaseOrderService } from '@app/purchaseOrder/purchase-order.service';
import { Vendor } from '@app/vendor/vendor';
import { NewVendorService } from '@app/vendor/newvendor.service';
import { Product } from '@app/product/product';
import { ProductService } from '@app/product/product.service';
import { PDFURL } from '@app/constants';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule, MatComponentsModule, ReactiveFormsModule],
  templateUrl: './viewer.component.html',
})
export class ViewerComponent implements OnInit, OnDestroy {
  // form
  generatorForm: FormGroup;
  vendorid: FormControl;
  productid: FormControl;
  purchaseOrderid: FormControl;
  // data
  formSubscription?: Subscription;
  //products: Product[] = []; // everybody's products
  purchaseOrders: PurchaseOrder[] = [];
  vendors: Vendor[] = []; // all vendors
  vendorProducts?: Product[]; // products for selected vendor
  purchaseOrderProducts?: Product[]; // products matching purchaseOrder items keys

  items: PurchaseOrderItem[] = []; // product items that will be in purchaseOrder
  selectedProduct: Product; // the current selected product
  selectedPurchaseOrder: PurchaseOrder;
  selectedVendor: Vendor; // the current selected vendor
  // misc
  pickedVendor: boolean;
  pickedPurchaseOrder: boolean;
  generated: boolean;
  hasPurchaseOrder: boolean;
  msg: string;
  total: number;
  subtotal: number;
  tax: number;
  purchaseOrderno: number = 0;

  constructor(
    private builder: FormBuilder,
    private vendorService: NewVendorService,
    private productService: ProductService,
    private purchaseOrderService: PurchaseOrderService
  ) {
    this.pickedVendor = false;
    this.pickedPurchaseOrder = false;
    this.generated = false;
    this.msg = '';
    this.vendorid = new FormControl('');
    this.productid = new FormControl('');
    this.purchaseOrderid = new FormControl('');
    this.generatorForm = this.builder.group({
      productid: this.productid,
      vendorid: this.vendorid,
      purchaseOrderid: this.purchaseOrderid,
    });
    this.selectedProduct = {
      id: '',
      vendorid: 0,
      name: '',
      costprice: 0.0,
      msrp: 0.0,
      rop: 0,
      eoq: 0,
      qoh: 0,
      qoo: 0,
      qrcode: '',
      qrcodetxt: '',
    };
    this.selectedVendor = {
      id: 0,
      name: '',
      address1: '',
      city: '',
      province: '',
      postalcode: '',
      phone: '',
      type: '',
      email: '',
    };
    this.selectedPurchaseOrder = {
      id: 0,
      vendorid: 0,
      amount: 0,
      items: [],
      podate: '',
    };
    this.hasPurchaseOrder = false;
    this.total = 0.0;
    this.subtotal = 0.0;
    this.tax = 0.0;
  } // constructor
  ngOnInit(): void {
    this.onPickVendor(); // sets up subscription for dropdown click
    this.onPickPurchaseOrder();
    this.msg = 'loading vendors from server...';
    this.getAllVendors();
  } // ngOnInit
  ngOnDestroy(): void {
    if (this.formSubscription !== undefined) {
      this.formSubscription.unsubscribe();
    }
  } // ngOnDestroy
  /**
   * getAllVendors - retrieve everything
   */
  getAllVendors(passedMsg: string = ''): void {
    this.vendorService.getAll().subscribe({
      // Create observer object
      next: (vendors: Vendor[]) => {
        console.log('Vendor:', vendors);
        this.vendors = vendors;
      },
      error: (err: Error) =>
        (this.msg = `Couldn't get vendors - ${err.message}`),
      complete: () =>
        passedMsg ? (this.msg = passedMsg) : (this.msg = `Vendors loaded!`),
    });
  } // getAllVendors

  getAllPurchaseOrders(vendorId: number): void {
    console.log('Fetching purchaseOrders for vendorId:', vendorId);
    this.purchaseOrderService.getById(vendorId).subscribe((purchaseOrder) => {
      console.log('PurchaseOrder:', purchaseOrder);

      // Check if the server response is an array or a single object
      if (Array.isArray(purchaseOrder)) {
        this.purchaseOrders = purchaseOrder;
      } else {
        this.purchaseOrders = [purchaseOrder]; // Wrap the single purchaseOrder in an array
      }

      this.msg = 'Vendors and purchaseOrders loaded!';
      console.log('Complete!');
    });
  }

  /**
   * loadVendorProducts - obtain a particular vendor's products
   * we'll match the purchaseOrder products to them later
   */
  loadVendorProducts(id: number): void {
    // products aren't part of the page, so we don't use async pipe here
    this.msg = 'loading products...';
    this.productService
      .getSome(id)
      .subscribe((products) => (this.vendorProducts = products));
  }

  getItemQuantity(item: any): number {
    if ('qty' in item) {
      return item.qty;
    } else {
      // Assuming each item has a productid property
      const matchingItem = this.selectedPurchaseOrder?.items.find(
        (orderItem) => orderItem.productid === item.id
      );

      return matchingItem ? matchingItem.qty : 0;
    }
  }

  /**
   * onPickVendor - Another way to use Observables, subscribe to the select change event
   * then load specific vendor products for subsequent selection
   */
  onPickVendor(): void {
    this.formSubscription = this.generatorForm
      .get('vendorid')
      ?.valueChanges.subscribe((val) => {
        this.selectedProduct = {
          id: '',
          vendorid: 0,
          name: '',
          costprice: 0.0,
          msrp: 0.0,
          rop: 0,
          eoq: 0,
          qoh: 0,
          qoo: 0,
          qrcode: '',
          qrcodetxt: '',
        };
        this.selectedPurchaseOrder = {
          id: 0,
          vendorid: 0,
          amount: 0,
          items: [],
          podate: '',
        };
        this.selectedVendor = val;
        this.loadVendorProducts(val.id);
        this.getAllPurchaseOrders(val.id); // Pass the vendor id to load purchaseOrders
        this.pickedPurchaseOrder = false;
        this.hasPurchaseOrder = false;
        this.msg = 'choose PurchaseOrder for vendor';
        this.pickedVendor = true;
        this.generated = false;
        this.items = []; // array for the purchaseOrder
        //this.selectedProduct = []; // array for the details in app html
      });
  } // onPickVendor

  onPickPurchaseOrder(): void {
    const purchaseOrderSubscription = this.generatorForm
      .get('purchaseOrderid')
      ?.valueChanges.subscribe((val) => {
        console.log('Selected PurchaseOrder:', val);
        this.selectedPurchaseOrder = val;

        if (this.vendorProducts !== undefined) {
          this.purchaseOrderProducts = this.vendorProducts.filter((product) =>
            this.selectedPurchaseOrder?.items.some(
              (item) => item.productid === product.id
            )
          );
        }
        console.log('PurchaseOrder Products:', this.purchaseOrderProducts);

        this.hasPurchaseOrder = true;

        this.purchaseOrderno = this.selectedPurchaseOrder.id;

        console.log('Length is ' + this.items.length);

        this.total = 0.0;
        this.purchaseOrderProducts?.forEach((product) => {
          const matchingItem = this.selectedPurchaseOrder?.items.find(
            (item) => item.productid === product.id
          );

          if (matchingItem) {
            this.subtotal += product.costprice * matchingItem.qty;
          }
        });

        this.tax = this.subtotal * 0.13;
        this.total = this.subtotal + this.tax;
      });

    this.formSubscription?.add(purchaseOrderSubscription);
  } // onPickPurchaseOrder

  viewPdf(): void {
    window.open(`${PDFURL}${this.purchaseOrderno}`, '');
  } // viewPdf
}
