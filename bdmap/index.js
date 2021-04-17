const axios = require('axios')

const url = 'http://api.map.baidu.com/reverse_geocoding/v3/'

// const sk = 'oBOQWcOq9PlEaL6zyo44ZsqplnQQCjIs'
//
async function main(){
//   const l = await axios.get('http://api.map.baidu.com/geoconv/v1/',{
//     params:{
//       coords: '106.525928,29.59976',
//       from: '1',
//       ak: 'vbsSEGVgIZMxhhTZgwiBtqeKOWuUnh31',
//       output: 'json',
//       to: '5'
//     }
//   })
//   const location = l.data.result[0]
//   console.log(l.data)
  // 106.53602153148,29.594589486285
  // 106.53489712681,29.603456095838
  const res = await axios.get(url, {
    params:{
      location: `29.603456095838,106.53489712681`,
      coordtype: 'bd09ll',
      // ret_coordtype: 'bd09ll',
      ak: 'vbsSEGVgIZMxhhTZgwiBtqeKOWuUnh31',
      output: 'json',
      poi_types: '地铁站',

      extensions_poi:1,
      radius: 1000

    }
  })
  console.log(res.data.result)
}

const u = '/xiaoqu/2411048614076/'
const id = u.split('/')
console.log(id[id.length-2])

// main().catch(console.error)
