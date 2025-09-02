import { test, expect, Page } from '@playwright/test';

// 🔹 Helper: Random item picker
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🔹 Helper: Login to Odoo
async function login(page: Page, username: string, password: string) {
  await page.goto('http://192.168.0.30:8081/odoo');
  await page.fill('input[name="login"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page.locator('.o_main_navbar')).toBeVisible();
}

// 🔹 Pick random option from an Odoo dropdown
// 🔹 Pick random option from an Odoo dropdown (excluding "Search More...")
async function selectRandomDropdownOption(page: Page, selector: string) {
  await page.click(selector);

  // Wait for dropdown suggestions to show
  const options = page.locator('.ui-menu-item > a');
  await expect(options.first()).toBeVisible();

  // Collect all texts
  const count = await options.count();
  if (count === 0) throw new Error("No options found in dropdown");

  // Build valid indexes excluding "Search More..."
  const validIndexes: number[] = [];
  for (let i = 0; i < count; i++) {
  let text = (await options.nth(i).innerText()).trim();

  // Normalize casing and spaces
  text = text.replace(/\s+/g, ' ').toLowerCase();

  // Exclude unwanted options
  if (text !== 'search more...' && text !== 'start typing...') {
    validIndexes.push(i);
  }
}

for (let i = 0; i < count; i++) {
  let text = (await options.nth(i).innerText()).trim();

  // Normalize casing and spaces
  text = text.replace(/\s+/g, ' ').toLowerCase();

  // Exclude unwanted options
  if (text !== 'search more...' && text !== 'start typing...') {
    validIndexes.push(i);
  }
}


  if (validIndexes.length === 0) throw new Error("Only 'Search More...' was found");

  // Pick random valid index
  const randomIndex = validIndexes[Math.floor(Math.random() * validIndexes.length)];

  // Get and click option
  const optionText = await options.nth(randomIndex).innerText();
  await options.nth(randomIndex).click();

  return optionText;
}


// 🔹 Helper: Create Sales Order
async function createSalesOrder(
  page: Page,
  paymentTerm: string,
  productCount: number
) {
  await page.goto('http://192.168.0.30:8081/odoo/sales/new');
  await expect(page).toHaveURL(/sales\/new/);

  // Customer → pick random from dropdown
  const randomCustomer = await selectRandomDropdownOption(page, '.o_field_widget[name="partner_id"] input');
  console.log("Picked customer:", randomCustomer);

  // Payment Term (still fixed for now)
  await page.click('.o_field_widget[name="payment_term_id"] input');
  await page.fill('.o_field_widget[name="payment_term_id"] input', paymentTerm);
  await page.keyboard.press('Enter');

  // Loop to add products
  for (let i = 0; i < productCount; i++) {
    await page.click('a:has-text("Add a product")');

    // Pick random product from dropdown
    const randomProduct = await selectRandomDropdownOption(page, '.o_field_widget[name="product_template_id"] input');
    console.log("Picked product:", randomProduct);

    // Random quantity 1–5
    const qty = String(Math.floor(Math.random() * 5) + 1);
    await page.fill('.o_field_widget[name="product_uom_qty"] input', qty);
    await page.keyboard.press('Enter');
  }
}

// 🔹 Helper: Save Sales Order
async function saveSalesOrder(page: Page) {
  await page.click('//html/body/div[1]/div/div/div[1]/div/div[1]/div[3]/div/button[1]');
  await expect(page.locator('.o_form_statusbar')).toContainText(/Quotation/i);
}

// 🔹 Helper: Confirm Sales Order
async function confirmSalesOrder(page: Page) {
  await page.click('//html/body/div[1]/div/div/div[2]/div/div[1]/div[1]/div[1]/button[2]');
  await expect(page.locator('.o_form_statusbar')).toContainText(/Sales Order/i);
}

// 🔹 Main Test
test.describe('Odoo Sales Automation', () => {
  test('should create and confirm a sales order with random dropdown picks', async ({ page }) => {
    await login(page, 'admin', '1');

    // Create order with random customer + 1–3 random products
    await createSalesOrder(page, 'Immediate Payment', Math.floor(Math.random() * 3) + 1);

    await saveSalesOrder(page);
    await confirmSalesOrder(page);

    
    // 📸 Take screenshot after confirmation
    let file_type = '.png'
    let file_name = `screenshot_sales_order_confirmed_#${Math.floor(Math.random() * 9000) + 1000}_${Date.now()}${file_type}`;
    await page.screenshot({ path: file_name, fullPage: true });
  });
});
