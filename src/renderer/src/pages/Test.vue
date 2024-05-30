<template>
  <div class="test view-container">
    <t-button @click="createVideo('hls')">create hls</t-button>
    <t-button @click="createVideo('webtorrent')">create webtorrent</t-button>
    <t-button @click="switchVideo()">switch webtorrent</t-button>
    <!-- <img src="tmp/thumbnail/output.png" alt="" style="width: 100%;"> -->
    <!-- <div id="video" ref="videoRef" style="width: 500px;height: 500px;" /> -->
    <div id="video2" style="width: 500px;height: 500px;" />

  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, shallowRef } from 'vue';
// import Artplayer from 'artplayer';
// import DPlayer from 'dplayer';
// import Hls from 'hls.js';
import { playerBarrage, playerCreate, playerDestroy, playerNext, playerSeek, playerPause, playerTimeUpdate, offPlayerTimeUpdate, offPlayerBarrage } from '@/utils/common/player';
// import WebTorrent from '@/pages/play/js/webtorrent';
// import request from '@/utils/request';
// import NODERSA from '@/utils/drpy/utils/node-rsa';
// import { loadExternalResource } from '@/utils/tool'
// import axios from 'axios';
// import Worker from '@/utils/drpy/worker?worker';

// const worker = new Worker();

// const doWork = (data) => {
//   return new Promise((resolve, reject) => {
//     worker.onmessage = (event) => {
//       const response = event.data;
//       resolve(response);
//     };

//     worker.onerror = (error) => {
//       reject(error);
//     };

//     worker.postMessage(data);
//   })
// }

const videoRef = ref();
const art = shallowRef();

const createVideo = async (type) => {
  // const publicStream = {
  //   create: {
  //     customHls: (video: HTMLVideoElement, url: string): Hls | null => {
  //       if (Hls.isSupported()) {
  //         const options = {};
  //         const hls = new Hls(options);
  //         hls.loadSource(url);
  //         hls.attachMedia(video);
  //         return hls;
  //       } else {
  //         console.log('Hls is not supported.');
  //         return null;
  //       }
  //     },
  //   }
  // }
  // const playerConfig = {
  //   artplayer: {
  //     container: document.getElementById('artplayer'),
  //     url: '',
  //     type: '',
  //     autoplay: true,
  //     playbackRate: true,
  //     fullscreen: true,
  //     pip: true,
  //     setting: true,
  //     flip: true,
  //     hotkey: true,
  //     isLive: false,
  //     customType: {
  //       customHls: (video: HTMLVideoElement, url: string, art: Artplayer) => {
  //         art.loading.show = true;
  //         if (art.hls) art.hls.destroy();
  //         const hls = publicStream.create.customHls(video, url);
  //         art.hls = hls;
  //         art.on('destroy', () => {
  //           hls!.destroy();
  //           delete art.hls;
  //         });
  //         art.loading.show = false;
  //       },
  //     }
  //   }
  // }
  // const mapVideoTypeToPlayerType = (videoType: string): string | undefined => {
  //   switch (videoType) {
  //     case 'mp4':
  //       return 'customMp4';
  //     case 'flv':
  //       return 'customFlv';
  //     case 'm3u8':
  //       return 'customHls';
  //     case 'mpd':
  //       return 'customDash';
  //     case 'magnet':
  //       return 'customWebTorrent';
  //     default:
  //       return 'customHls';
  //   }
  // };
  // const playerMethod = {
  //   artplayer: {
  //     create: (options: any): Artplayer => {
  //       Artplayer.PLAYBACK_RATE = [0.5, 0.75, 1, 1.25, 1.5, 2];
  //       return new Artplayer({ ...options });
  //     },
  //     playNext: (player: Artplayer, options: any) => {
  //       player.switch = options.url;
  //       // player.switchUrl(options.url);
  //     },
  //   }
  // }
  // const playerCreate = async (
  //   url: string,
  //   type: string,
  //   container: string | Element,
  //   playerMode: string,
  //   videoType: string = '',
  // ) => {
  //   const creators = {
  //     artplayer: playerMethod.artplayer.create,
  //   };

  //   let config = playerConfig[playerMode];
  //   const creator = creators[playerMode];
  //   if (playerMode === 'artplayer') {
  //     config.container = container;
  //     config.url = url;
  //     config.type = mapVideoTypeToPlayerType(videoType);
  //   }

  //   return creator(config);
  // };
  // const playerNext = (player: any, playerMode: string, options: any) => {
  //   const nexts = {
  //     artplayer: playerMethod.artplayer.playNext,
  //   };
  //   const next = nexts[playerMode];

  //   let data = {
  //     url: options.url,
  //     type: mapVideoTypeToPlayerType(options.mediaType),
  //   };

  //   next(player, data);
  // };
  art.value = await playerCreate('https://voddemo-play.volcvod.com/10501b001bdd43ae89d7c0fc3d6792b5/main.m3u8?a=0&auth_key=1773925042-f0489f7ac9a14d92b96bbfb7b39a7a0d-0-4e57d65b22e9aefe63ba1c519218e9fe&br=966&bt=966&cd=0%7C0%7C0&ch=0&cr=0&cs=0&cv=1&dr=0&ds=4&er=0&l=2023032020544973DCCFE21CF4C02E38B1&lr=&mime_type=video_mp4&net=0&pl=0&qs=0&rc=amg6c2o0aTg6ZTQzNGRnM0ApOmZkZzg1PGVoNzhkOzxlZ2dfZy9gMHFrYTBgLS1kYy9zcy00L2JfL19eYF42Ly0vYi06Yw%3D%3D&vl=&vr=', 'film', '#video2', 'nplayer', 'm3u8');
  art.value.on(art.value.Event.TIME_UPDATE, ()=>{
    console.log(art.value.currentTime)
    console.log(art.value.duration)

  })
  setTimeout(async() => {
    // const data = {
    //   url: 'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/hls/xgplayer-demo.m3u8',
    //   type: 'm3u8'
    // }
    // await playerNext(art.value, 'nplayer', data)
    playerPause(art.value, 'nplayer')
  }, 6000)
}

const switchVideo = () => {
  art.value.switch = 'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/hls/xgplayer-demo.m3u8'
}

onMounted(async () => {
  // rsa_demo_test(); // nodersa

  // axios.get('http://101.132.136.85:288/armtest.php/provide/vod/', {
  //   timeout: 3000 // 设置超时时间为5秒
  // }) // timeout


  // await loadExternalResource('https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js', 'js'); // loadExternalResource
  // new Artplayer();


  const magnetUrl = {
    url0: 'magnet:?xt=urn:btih:51d5e1bbfff56f08785ddebf80a60054c9872ccb&dn=fcrs2.2160p.H265.HDR.6v%E7%94%B5%E5%BD%B1%20%E5%9C%B0%E5%9D%80%E5%8F%91%E5%B8%83%E9%A1%B5%20www.6v123.net%20%E6%94%B6%E8%97%8F%E4%B8%8D%E8%BF%B7%E8%B7%AF&tr=udp://opentracker.i2p.rocks:6969/announce&tr=udp://tracker.altrosky.nl:6969/announce',
    url1: 'magnet:?xt=urn:btih:51d5e1bbfff56f08785ddebf80a60054c9872ccb&dn=fcrs2.2160p.H265.HDR.6v%E7%94%B5%E5%BD%B1%20%E5%9C%B0%E5%9D%80%E5%8F%91%E5%B8%83%E9%A1%B5%20www.6v123.net%20%E6%94%B6%E8%97%8F%E4%B8%8D%E8%BF%B7%E8%B7%AF&tr=udp://opentracker.i2p.rocks:6969/announce&tr=udp://tracker.altrosky.nl:6969/announce',
    url2: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent',
  }


  // t3
  // const test_rule_url = 'https://zy.catni.cn/996%E5%BD%B1%E8%A7%86.js';
  // const test_rule_url = 'https://ghproxy.liuzhicong.com/https://github.com/hjdhnx/dr_py/raw/main/js/ikanbot3.js';
  // const test_rule_url = 'https://raw.githubusercontent.com/hjdhnx/dr_py/main/js/360%E5%BD%B1%E8%A7%86.js';
  // const test_rule_url = 'http://hipy.nokia.press/files/drpy_js/%E8%8D%90%E7%89%87.js';

  // const test_data = await axios.get(test_rule_url);
  // const rule = test_data.data;

  // const init_res = await doWork({type:'init', data: rule});
  // console.log(init_res)
  // const home_res = await doWork({type:'home'});
  // console.log(home_res)
  // const homeVod_res = await doWork({type:'homeVod'});
  // console.log(homeVod_res)
  // const category_res = await doWork({type:'category', data: { tid:3, pg: 1, filter:false, extend:{} }});
  // console.log(category_res)
  // const detail_res = await doWork({type:'detail', data: '3$/detail/790.html'});
  // console.log(detail_res)
  // const play_res = await doWork({type:'play', data: { flag:'索尼', id:'https://www.cs1369.com/play/790-1-1.html', flags:[] }});
  // console.log(play_res)
});

const rsa_demo_test = () => {
  let t1 = new Date().getTime();
  let pkcs1_public = `
-----BEGIN RSA PUBLIC KEY-----
MEgCQQCrI0pQ/ERRpJ3Ou190XJedFq846nDYP52rOtXyDxlFK5D3p6JJu2RwsKwy
lsQ9xY0xYPpRZUZKMEeR7e9gmRNLAgMBAAE=
-----END RSA PUBLIC KEY-----
`.trim();

  let pkcs1_public_pem = `
MEgCQQCrI0pQ/ERRpJ3Ou190XJedFq846nDYP52rOtXyDxlFK5D3p6JJu2RwsKwy
lsQ9xY0xYPpRZUZKMEeR7e9gmRNLAgMBAAE=
`.trim();

  let pkcs8_public = `
-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKsjSlD8RFGknc67X3Rcl50WrzjqcNg/
nas61fIPGUUrkPenokm7ZHCwrDKWxD3FjTFg+lFlRkowR5Ht72CZE0sCAwEAAQ==
-----END PUBLIC KEY-----`.trim();

  let pkcs8_public_pem = `
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKsjSlD8RFGknc67X3Rcl50WrzjqcNg/
nas61fIPGUUrkPenokm7ZHCwrDKWxD3FjTFg+lFlRkowR5Ht72CZE0sCAwEAAQ==
`.trim();

  let pkcs1_private = `
-----BEGIN RSA PRIVATE KEY-----
MIIBOAIBAAJBAKsjSlD8RFGknc67X3Rcl50WrzjqcNg/nas61fIPGUUrkPenokm7
ZHCwrDKWxD3FjTFg+lFlRkowR5Ht72CZE0sCAwEAAQI/b6OV1z65UokQaMvSeRXt
0Yv6wiYtduQI9qpq5nzy/ytaqsbBfClNTi/HifKPKxlRouWFkc518EQI8LBxoarJ
AiEA4DaONMplV8PQNa3TKn2F+SDEvLOCjdL0kHKdN90Ti28CIQDDZnTBaHgZwZbA
hS7Bbf5yvwjWMhO6Y7l04/Qm7R+35QIgPuQuqXIoUSD080mp1N5WyRW++atksIF+
5lGv9e6GP/MCICnj8y/rl6Pd7tXDN6zcSeqLrfdNsREKhB3dKOCXgW9JAiAFYtFS
EJNBXVRTK42SNsZ2hJ/9xLwOwnH2epT8Q43s3Q==
-----END RSA PRIVATE KEY-----
`.trim()

  let pkcs8_private = `
-----BEGIN PRIVATE KEY-----
MIIBUgIBADANBgkqhkiG9w0BAQEFAASCATwwggE4AgEAAkEAqyNKUPxEUaSdzrtf
dFyXnRavOOpw2D+dqzrV8g8ZRSuQ96eiSbtkcLCsMpbEPcWNMWD6UWVGSjBHke3v
YJkTSwIDAQABAj9vo5XXPrlSiRBoy9J5Fe3Ri/rCJi125Aj2qmrmfPL/K1qqxsF8
KU1OL8eJ8o8rGVGi5YWRznXwRAjwsHGhqskCIQDgNo40ymVXw9A1rdMqfYX5IMS8
s4KN0vSQcp033ROLbwIhAMNmdMFoeBnBlsCFLsFt/nK/CNYyE7pjuXTj9CbtH7fl
AiA+5C6pcihRIPTzSanU3lbJFb75q2SwgX7mUa/17oY/8wIgKePzL+uXo93u1cM3
rNxJ6out902xEQqEHd0o4JeBb0kCIAVi0VIQk0FdVFMrjZI2xnaEn/3EvA7CcfZ6
lPxDjezd
-----END PRIVATE KEY-----
`.trim()

  let data = `
NodeRsa
这是node-rsa 现在修改集成在drpy里使用`.trim();

  let encryptedWithPublic = NODERSA.encryptRSAWithPublicKey(data, pkcs1_public, {
    // PublicFormat: "pkcs1-public-pem",
    outputEncoding: "base64",
    options: { environment: "browser", encryptionScheme: 'pkcs1_oaep' },
  });
  console.log("公钥加密");
  console.log(encryptedWithPublic);


  let decryptedWithPrivate = NODERSA.decryptRSAWithPrivateKey(encryptedWithPublic, pkcs1_private, {
    // PublicFormat: "pkcs1-private",
    // outEncoding: "hex"
    options: { environment: "browser", encryptionScheme: 'pkcs1_oaep' },
  });
  console.log("私钥解密");
  console.log(decryptedWithPrivate);


  // https://www.btool.cn/rsa-sign
  let pkcs1_sha256_sign = NODERSA.sign("1", pkcs1_private, {
    outputEncoding: "base64",
    options: { environment: "browser", encryptionScheme: 'pkcs1', signingScheme: "pkcs1-sha256" },
  });
  console.log("pkcs1_sha256_sign");
  console.log(pkcs1_sha256_sign);

  let pkcs1_sha256_sign_verify = NODERSA.verify("1", "Oulx2QrgeipKYBtqEDqFb2s/+ndk2cGQxO4CkhU7iBM1vyNmmvqubpsmeoUuN3waGrYZLknSEdwBkfv0tUMpFQ==", pkcs1_private, {
    options: { environment: "browser", encryptionScheme: 'pkcs1', signingScheme: "pkcs1-sha256" },
  });
  console.log("pkcs1_sha256_sign_verify");
  console.log(pkcs1_sha256_sign_verify);

  let pkcs1_oaep_sha256 = NODERSA.encryptRSAWithPublicKey(data, `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEA5KOq1gRNyllLNWKQy8sGpZE3Q1ULLSmzZw+eaAhj9lvqn7IsT1du
SYn08FfoOA2qMwtz+1O2l1mgzNoSVCyVpVabnTG+C9XKeZXAnJHd8aYA7l7Sxhdm
kte+iymYZ0ZBPzijo8938iugtVvqi9UgDmnY3u/NlQDqiL5BGqSxSTd/Sgmy3zD8
PYzEa3wD9vehQ5fZZ45vKIq8GNVh2Z8+IGO85FF1OsN7+b2yGJa/FmDDNn0+HP+m
PfI+kYBqEVpo0Ztbc3UdxgFwGC8O1n8AQyriwHnSOtIiuBH62J/7qyC/3LEAApRb
Dd9YszqzmODjQUddZKHmvc638VW+azc0EwIDAQAB
-----END RSA PUBLIC KEY-----
`, {
    outputEncoding: "base64",
    options: {
      environment: "browser", encryptionScheme: {
        scheme: "pkcs1_oaep",
        hash: "sha256",
      },
    }
    // options: { environment: "browser", encryptionScheme: 'pkcs1' },
  });
  console.log("pkcs1_oaep_sha256");
  console.log(pkcs1_oaep_sha256);

  decryptedWithPrivate = NODERSA.decryptRSAWithPrivateKey("kSZesAAyYh2hdsQnYMdGqb6gKAzTauBKouvBzWcc4+F8RvGd0nwO6mVkUMVilPgUuNxjEauHayHiY8gI3Py45UI3+km0rSGyHrS6dHiHgCkMejXHieglYzAB0IxX3Jkm4z/66bdB/D+GFy0oct5fGCMI1UHPjEAYOsazJDa8lBFNbjiWFeb/qiZtIx3vGM7KYPAZzyRf/zPbbQ8zy9xOmRuOl5nnIxgo0Okp3KO/RIPO4GZOSBA8f2lx1UtNwwrXAMpcNavtoqHVcjJ/9lcotXYQFrn5b299pSIRf2gVm8ZJ31SK6Z8cc14nKtvgnmsgClDzIXJ1o1RcDK+knVAySg==", `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA5KOq1gRNyllLNWKQy8sGpZE3Q1ULLSmzZw+eaAhj9lvqn7Is
T1duSYn08FfoOA2qMwtz+1O2l1mgzNoSVCyVpVabnTG+C9XKeZXAnJHd8aYA7l7S
xhdmkte+iymYZ0ZBPzijo8938iugtVvqi9UgDmnY3u/NlQDqiL5BGqSxSTd/Sgmy
3zD8PYzEa3wD9vehQ5fZZ45vKIq8GNVh2Z8+IGO85FF1OsN7+b2yGJa/FmDDNn0+
HP+mPfI+kYBqEVpo0Ztbc3UdxgFwGC8O1n8AQyriwHnSOtIiuBH62J/7qyC/3LEA
ApRbDd9YszqzmODjQUddZKHmvc638VW+azc0EwIDAQABAoIBADZ/QGgUzInvsLp/
zO2WbfYm39o/uhNAvk9RbLt1TIZbMFhyOpeKynHi3Swwd9xsfWX/U9zS/lGi/m31
iKrhmaW4OA1G3vqpMcK7TBbFufYwUEaA+ZJX344euH8pIfdzyneMQ4z3Far2dS7l
QsmjuilVV2kEFadveXewiYoVOWCu00w6bN8wy2SIHlQn+kIL6HQhWz12iKKflIKu
eGRdzLHsKmBt6WbY1Wuhx7HU0fAKdlBDPxCHNlI+kybUYE9o5C2vJiaVM5wqJBgZ
8Dz8kt1QbLJ910JoLXkLVQ8uC8NJKQwFtqQjTGPnEq0+wbgz6Ij599rKZkwW/xq9
l6KoUiECgYEA6Ah42tVdkNW047f03xVYXFH96RgorHRS36mR8Y+ONUq1fwKidovC
WjwVujt4OPf3l1W6iyn/F6cu/bsmvPrSc3HTN0B1V31QK4OjgetxQ2PSbTldH02J
NPzkt+v+cPxXpx/P5mgt7Weefw5txU547KubGrHUV5rBKFtIx9pj16MCgYEA/EF0
o19+D24DZAPwlDS5VbEd7FStnwY4oQ5PqbuNOSbSJLMWU0AqzXcRokp8UTyCZ0X3
ATkS1REq97kShCuR+npTR6a6DlY7sdpPI1SMLNajgB2tkx0EOzX+PfNIbHUd4jpJ
I0ZMAHv/OOtkzQHDaeTWBTrzsWm6/nTiykfduNECgYEA46AMD4HpPECqKAs66e5i
tI6q7JSKskObWVdcmQEfnSAhVOwcvPb2Ptda6UuV8S0xcwDi88rLOUUFUFzc79+P
vTkY38cYVi/VChsluDpk7ptqv0PbGu5Rf+3n4pZdEjI7OvR2W64wAAn67uIUxc7p
yiO/ET0K9rYWb6S9jXGtKMkCgYEA2kPAqoO7zZoBMQ7/oR0lp/HC1HRIbiqx4RlC
8Lgpb+QZPEwA6zPAVVvLVENi4d+bbcRp/xLlKpraNNJcJSSWAMbLPFoU7sbKjA87
HnTPfRSTEA2d3Ibk3F7Rh8TzS3Ti0JZiJjVzGZAwu41iAMifzwaD8K6boUy80eNN
QH2CaaECgYBUsLYvC/MiYg3w+LGOONuQongoVUXjGqnw2bjVa9RK7lwRdXPUqJ51
MpVO98IkoLvGSI/0sGNP3GKNhC+eMGjJAVwFyEuOn+JsmMv9Y9uStIVi5tIHIhKw
m7mp8il0kaftHdSxTbspG3tZ2fjIiFIZkLEOmRpd7ogWumgOajzUdA==
-----END RSA PRIVATE KEY-----`, {
    // PublicFormat: "pkcs1-private",
    // outEncoding: "hex"
    options: { environment: "browser", encryptionScheme: 'pkcs1_oaep' },
  });
  console.log('decryptedWithPrivate');
  console.log(decryptedWithPrivate);


  (() => {
    let key = new NODERSA.NodeRSA({ b: 1024 });
    key.setOptions({ encryptionScheme: 'pkcs1' })
    let text = `你好drpy node-ras`;
    let encrypted = key.encrypt(text, 'base64');
    console.log('encrypted: ', encrypted);
    const decrypted = key.decrypt(encrypted, 'utf8');
    console.log('decrypted: ', decrypted);
  })();
  let t2 = new Date().getTime();
  console.log('rsa_demo_test 测试耗时:' + (t2 - t1) + '毫秒');
}
</script>

<style lang="less" scoped>
.view-container {
  height: 100%;
  width: 100%;
}
</style>
