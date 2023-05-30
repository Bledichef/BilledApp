/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toHaveClass("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

describe("When I click on the new bill button", () => {
  test("Then a modal with a form should open", () => {
    //si l'user se trouve sur la page contenant bills dans url -> on affiche la route du même nom
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    const html = BillsUI({ data: bills });
    document.body.innerHTML = html;

    // On est sur la page employé
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    // on instancie la classe Bills
    const bill = new Bills({
      document,
      onNavigate,
      store: null,
      bills,
      localStorage: window.localStorage,
    });

    const button = screen.getByTestId("btn-new-bill"); //on récup le data-testid du bouton

    const handleClickNewBill = jest.fn(() => bill.handleClickNewBill());
    button.addEventListener("click", handleClickNewBill); // au clic on appelle la fonction
    userEvent.click(button); // On simule le click

    expect(handleClickNewBill).toHaveBeenCalled(); //on vérifie que la fonction simulée a bien été appelée
    const modaleNewBill = screen.getByTestId("form-new-bill"); // on récup le dataId de la modale
    expect(modaleNewBill).toBeTruthy(); // on vérifie que la modale s'est bien ouverte (si elle apparait)
  });
});
