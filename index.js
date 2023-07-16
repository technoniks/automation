import { execSync } from 'child_process';
import {resolve} from 'dns'

const url_base =  'https://art.victorytime.games'
const url_login = '/api/user/login'
const url_balance = "/api/my/index"
const url_game_now = "/api/project/game_now"
const url_order_list = "/api/project/order_list"
const url_add_order = "/api/project/add_order"

let app_token = ''

const user = '%2B917058729796'
const pass = 'Game%40123'

async function userLogin(user, pass) {
  const body = `account=${user}&password=${pass}`
  let res = await fetch(url_base + url_login, get_data(body))
  res  = await res.json()
  return res['data']
}

async function gameNow(callback) {
  const body = "project_id=3"
  let res = await fetch(url_base + url_game_now, get_data(body))
  res = await res.json()
  return res['data']
}

async function getLatestOrders(callback) {
  const body = "page=1&limit=10"
  let res = await fetch(url_base + url_order_list, get_data(body))
  res = await res.json()
  return res['data']
}

async function addOrder(game_id, orderQty, pick, callback) {
  const body = `contract_type=1&contract_number=${orderQty}&type=1&pick=${pick}&game_id=${game_id}`
  let res = await fetch(url_base + url_add_order, get_data(body))
  return await res.json()
}

function isConnected () {
  return new Promise((res, reject) => {
    resolve('www.google.com', function(err) {
      console.log(err);
      if (err) {
         reject(false);
      } else {
        res(true);
      }
    });
  });
}

// ------------------------
let init_balance = false

// User login
let network = isConnected()
network.then(async connected => {
  const loginData = await userLogin(user, pass)
  app_token = loginData['userinfo']['token']
  while (true) {
    try {
      const gameData = await gameNow()
      const game_sn = gameData['sn']
      const game_date = gameData['date']
      const game_id = gameData['id']
      const user_balance = gameData['user_money']

      if ( !init_balance ) init_balance = user_balance

      const orders = await getLatestOrders()
      const lastOrder = orders['list'].reduce((acc, current) => {
        const currentNumber = Number(current['date'] +''+ current['sn'])
        const accNumber = Number(acc['date'] +''+ acc['sn'])
        // if(currentNumber == game_date + '' + game_sn) {
        //   acc['current'] = current
        // }
        // if(currentNumber == game_date + '' + game_sn) {
        //   acc['last'] = current
        // }
        if ( !acc ) {
          acc = current
        }else {
          if (currentNumber > accNumber) {
            acc = current
          }
        }
        return acc
      })

      if ( lastOrder['sn'] !== game_sn ) {
        let orderQty = 0
        if ( lastOrder['status'] == 1 ) {
          orderQty = 1
        }
        if ( lastOrder['status'] == 2 ) {
          console.log("here: ", lastOrder);
          const lastOrderQty = lastOrder['contract_number'] 
          orderQty = lastOrderQty * 2
        }
        if ( lastOrder['status'] != 0 ) {
          const data = await addOrder(game_id, orderQty, 'green')
          if ( data['msg'] === 'success' ) {
            console.log("order place successfully");
            console.log("orderQty: ", orderQty);
          }else {
            console.log("msg: ",data['msg']);
          }
        }
      }else {
        console.clear()
        console.log("Balance: ", user_balance);
        console.log("P/L : Rs.", user_balance - init_balance);
        console.log("Waiting for result ...");
      }
    }catch (error) {
      console.log("error: ",error);
      execSync('sleep 3')
    }
    execSync('sleep 10')
  }
})
// userLogin(user, pass, loginData => {
//   app_token = loginData['userinfo']['token']

//   while( true ) {
//     try {
//       // Get current game
//       gameNow(gameData => {
//         const game_sn = gameData['sn']
//         const game_id = gameData['id']
//         const user_balance = gameData['user_money']

//         if ( !init_balance ) init_balance = user_balance
        
//         // Get last game order
//         getLatestOrders(orders => {
//           lastOrder = orders['list'][0]
//           if ( lastOrder['sn'] !== game_sn ) {
//             let orderQty = 0
//             if ( lastOrder['amount'] ) {
//               orderQty = 1
//             }else {
//               lastOrderQty = lastOrder['contract_number'] 
//               orderQty = lastOrderQty * 2
//             }

//             // Place order
//             addOrder(game_id, orderQty, 'green', data => {
//               if ( data['msg'] === 'success' ) {
//                 console.log("order place successfully");
//                 console.log("orderQty: ", orderQty);
//               }else {
//                 console.log(data['msg']);
//               }
//             })
//           }else {
//             console.clear()
//             console.log("Balance: ", user_balance);
//             console.log("P/L : Rs.", user_balance - init_balance);
//             console.log("Waiting for result ...");
//           }
//         })
//       })
//       execSync('sleep 10')
//     } catch (error) {
//       console.log(error);
//       execSync('sleep 3')
//     }
//   }
//   })




function get_data( body = "" ) {
  return {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded",
      "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "token": app_token,
      "Referer": "https://victorytime.games/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": body,//"account=%2B917058729796&password=Game%40123",
    "method": "POST"
  }
}

// fetch("https://art.victorytime.games/api/user/login", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
//     "content-type": "application/x-www-form-urlencoded",
//     "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-site",
//     "token": "",
//     "Referer": "https://victorytime.games/",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": "account=%2B917058729796&password=Game%40123",
//   "method": "POST"
// });
