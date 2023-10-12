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
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [CommonModule, MatComponentsModule, ReactiveFormsModule],
  templateUrl: './generator.component.html',
})
export class GeneratorComponent implements OnInit, OnDestroy {
  // form
  generatorForm: FormGroup;
  vendorid: FormControl;
  productid: FormControl;
  qty: FormControl;

  // data
  formSubscription?: Subscription;
  products: Product[] = []; // everybody's products
  vendors: Vendor[] = []; // all vendors

  vendorproducts: Product[] = []; // all products for a particular vendor
  items: PurchaseOrderItem[] = []; // product items that will be in purchaseOrder
  selectedproducts: Product[] = []; // products that being displayed currently in app
  selectedProduct: Product; // the current selected product
  selectedVendor: Vendor; // the current selected vendor
  lineItems: PurchaseOrderItem[] = [];
  // misc
  pickedProduct: boolean;
  pickedVendor: boolean;
  pickedQty: boolean;
  generated: boolean;
  hasProducts: boolean;
  initialQty: number;
  modifyQty: number;
  initialCostprice: number;
  msg: string;
  subtotal: number;
  tax: number;
  total: number;
  selectedQuantity: number;
  purchaseOrderno: number = 0;

  eoqOptions: number[] = []; // Include EOQ as an option

  constructor(
    private builder: FormBuilder,
    private vendorService: NewVendorService,
    private productService: ProductService,
    private purchaseOrderService: PurchaseOrderService
  ) {
    this.pickedVendor = false;
    this.pickedProduct = false;
    this.pickedQty = false;
    this.generated = false;
    this.msg = '';
    this.initialQty = 0;
    this.modifyQty = 0;
    this.initialCostprice = 0;
    this.selectedQuantity = 0;
    this.vendorid = new FormControl('');
    this.productid = new FormControl('');
    this.qty = new FormControl(''); // Initialize quantity control with 0
    for (let i: number = 0; i < 1000; i++) {
      this.eoqOptions.push(i);
    }
    this.generatorForm = this.builder.group({
      productid: this.productid,
      vendorid: this.vendorid,
      qty: this.qty, // Add qty control to the form
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
    this.hasProducts = false;
    this.subtotal = 0.0;
    this.tax = 0.0;
    this.total = 0.0;
  } // constructor
  ngOnInit(): void {
    this.onPickVendor(); // sets up subscription for dropdown click
    this.onPickProduct(); // sets up subscription for dropdown click
    this.onPickQty();
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
        this.vendors = vendors;
      },
      error: (err: Error) =>
        (this.msg = `Couldn't get vendors - ${err.message}`),
      complete: () =>
        passedMsg ? (this.msg = passedMsg) : (this.msg = `Vendors loaded!`),
    });
  } // getAllVendors
  /**
   * loadVendorProducts - retrieve a particular vendor's products
   */
  loadVendorProducts(): void {
    this.vendorproducts = [];
    this.productService.getSome(this.selectedVendor.id).subscribe({
      // observer object
      next: (products: Product[]) => {
        this.vendorproducts = products;
      },
      error: (err: Error) =>
        (this.msg = `product fetch failed! - ${err.message}`),
      complete: () => {},
    });
  } // loadVendorProducts
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
        this.selectedVendor = val;
        this.loadVendorProducts();
        this.pickedProduct = false;
        this.hasProducts = false;
        this.msg = 'choose product for vendor';
        this.pickedVendor = true;
        this.generated = false;
        this.items = []; // array for the purchaseOrder
        this.selectedproducts = []; // array for the details in app html
      });
  } // onPickVendor
  /**
   * onPickProduct - subscribe to the select change event then
   * update array containing items.
   */
  onPickProduct(): void {
    const productSubscription = this.generatorForm
      .get('productid')
      ?.valueChanges.subscribe((val) => {
        this.selectedProduct = val;

        this.msg = 'choose quantity for product';

        this.hasProducts = true;
      });

    this.formSubscription?.add(productSubscription); // add it as a child, so all can be destroyed together
  } // onPickProduct

  onPickQty(): void {
    const qtySubscription = this.generatorForm
      .get('qty')
      ?.valueChanges.subscribe((newQty) => {
        const item: PurchaseOrderItem = {
          id: 0, // Assign the appropriate ID
          purchaseOrderid: 0, // Assign the appropriate purchaseOrder ID
          productid: this.selectedProduct.id,
          qty: newQty,
          price: this.selectedProduct.costprice,
        };

        const itemindex = this.items.findIndex(
          (item) => item.productid === this.selectedProduct.id
        );

        if (newQty === 0 && itemindex !== -1) {
          this.items.splice(itemindex, 1);
          this.msg = `${this.selectedProduct.name} removed`;
        } else if (itemindex !== -1) {
          // if the item exists and qty NOT 0
          console.log(itemindex);

          this.msg = `${newQty} ${this.selectedProduct.name}(s) added`;
          this.items[itemindex].qty = newQty;
        } else {
          this.msg = `${newQty} ${this.selectedProduct.name}(s) added`;
          this.items.push(item);
        }
        console.log(this.selectedProduct.costprice + '  ' + newQty);

        this.subtotal = 0.0;
        this.tax = 0.0;
        this.total = 0.0;

        this.items.forEach((item) => {
          const index = this.vendorproducts.findIndex(
            (product) => product.id === item.productid
          );
          this.subtotal += this.vendorproducts[index].costprice * item.qty;
        });
        this.tax = this.subtotal * 0.13;
        this.total = this.subtotal + this.tax;
      });

    this.formSubscription?.add(qtySubscription);
  }

  /**
   * createPurchaseOrder - create the client side purchaseOrder
   */
  createPurchaseOrder(): void {
    this.generated = false;
    const purchaseOrder: PurchaseOrder = {
      id: 0,
      vendorid: this.selectedProduct.vendorid,
      amount: this.total,
      items: this.items,
    };

    this.purchaseOrderService.create(purchaseOrder).subscribe({
      next: (purchaseOrder: PurchaseOrder) => {
        // server should be returning report with new id
        purchaseOrder.id > 0
          ? (this.msg = `PurchaseOrder ${purchaseOrder.id} added!`)
          : (this.msg = 'PurchaseOrder not added! - server error');
        this.purchaseOrderno = purchaseOrder.id;
      },
      error: (err: Error) => {
        this.msg = `PurchaseOrder not added! - ${err.message}`;
      },
      complete: () => {
        this.hasProducts = false;
        this.pickedVendor = false;
        this.pickedProduct = false;
        this.pickedQty = false;
        this.generated = true;
      },
    });
  } // createPurchaseOrder
} // GeneratorComponent
