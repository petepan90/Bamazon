var mysql = require('mysql');
var inquirer = require('inquirer')

var connection = mysql.createConnection({
    port: 3306,
    host: 'localhost',
    user: 'root',
    password: "noahb19",
    database: 'bamazon'
});

connection.connect(function (error) {
    if (error) {
        console.error('error!!!', error);
        return;
    }

    console.log('connection made!', connection.threadId);

    showItems();
});

function showItems() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Item #: " + res[i].item_id + "|" +
                "Product: " + res[i].product_name + "|" +
                "Department: " + res[i].department_name + "|" +
                "Price: " + "$" + res[i].price + "|" +
                "In Stock: " + res[i].stock_quantity);
            console.log("--------------------------------------------------------------------------------");
        }
        buyItem();
    });

};

var buyItem = function () {
    inquirer.prompt([{
        name: "itemId",
        type: "input",
        message: "Enter Product ID Number:"
    }, {
        name: "quantity",
        type: "input",
        message: "How many units would you like to purchase?"
    }]).then(function (answer) {

        connection.query("SELECT * FROM products", function (err, res) {
            if (err) throw err;

            var chosenItem;
            for (var i = 0; i < res.length; i++) {
                if (res[i].item_id === parseInt(answer.itemId)) {
                    chosenItem = res[i];
                    //console.log(res[i].item_id);
                    //console.log(parseInt(answer.itemId));
                    //console.log("Chosen item is " + JSON.stringify(chosenItem));
                }
            }

            if (chosenItem.stock_quantity > parseInt(answer.quantity)) {
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [{
                            stock_quantity: (chosenItem.stock_quantity - parseInt(answer.quantity))
                        },
                        {
                            item_id: chosenItem.item_id
                        }
                    ],
                    function (error) {
                        if (error) throw error;
                        console.log("Thank you for your business! Your total is " + "$" + parseInt(answer.quantity) * chosenItem.price);
                    }
                );
            } else {
                console.log("We're sorry. We don't have enough in stock.");

            }
        });
    });
};