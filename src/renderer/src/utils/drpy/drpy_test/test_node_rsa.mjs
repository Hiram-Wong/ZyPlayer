import NODERSA from './node-rsa.js';

/**
 * rsa加解密的全方位测试案例
 */
function rsa_demo_test() {
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
`.trim();

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
`.trim();

  let data = `
NodeRsa
这是node-rsa 现在修改集成在drpy里使用`.trim();

  let encryptedWithPublic = NODERSA.encryptRSAWithPublicKey(data, pkcs1_public, {
    // PublicFormat: "pkcs1-public-pem",
    outputEncoding: 'base64',
    options: { environment: 'browser', encryptionScheme: 'pkcs1_oaep' },
  });
  console.log('公钥加密');
  console.log(encryptedWithPublic);

  let decryptedWithPrivate = NODERSA.decryptRSAWithPrivateKey(encryptedWithPublic, pkcs1_private, {
    // PublicFormat: "pkcs1-private",
    // outEncoding: "hex"
    options: { environment: 'browser', encryptionScheme: 'pkcs1_oaep' },
  });
  console.log('私钥解密');
  console.log(decryptedWithPrivate);

  // https://www.btool.cn/rsa-sign
  let pkcs1_sha256_sign = NODERSA.sign('1', pkcs1_private, {
    outputEncoding: 'base64',
    options: { environment: 'browser', encryptionScheme: 'pkcs1', signingScheme: 'pkcs1-sha256' },
  });
  console.log('pkcs1_sha256_sign');
  console.log(pkcs1_sha256_sign);

  let pkcs1_sha256_sign_verify = NODERSA.verify(
    '1',
    'Oulx2QrgeipKYBtqEDqFb2s/+ndk2cGQxO4CkhU7iBM1vyNmmvqubpsmeoUuN3waGrYZLknSEdwBkfv0tUMpFQ==',
    pkcs1_private,
    {
      options: { environment: 'browser', encryptionScheme: 'pkcs1', signingScheme: 'pkcs1-sha256' },
    },
  );
  console.log('pkcs1_sha256_sign_verify');
  console.log(pkcs1_sha256_sign_verify);

  let pkcs1_oaep_sha256 = NODERSA.encryptRSAWithPublicKey(
    data,
    `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEA5KOq1gRNyllLNWKQy8sGpZE3Q1ULLSmzZw+eaAhj9lvqn7IsT1du
SYn08FfoOA2qMwtz+1O2l1mgzNoSVCyVpVabnTG+C9XKeZXAnJHd8aYA7l7Sxhdm
kte+iymYZ0ZBPzijo8938iugtVvqi9UgDmnY3u/NlQDqiL5BGqSxSTd/Sgmy3zD8
PYzEa3wD9vehQ5fZZ45vKIq8GNVh2Z8+IGO85FF1OsN7+b2yGJa/FmDDNn0+HP+m
PfI+kYBqEVpo0Ztbc3UdxgFwGC8O1n8AQyriwHnSOtIiuBH62J/7qyC/3LEAApRb
Dd9YszqzmODjQUddZKHmvc638VW+azc0EwIDAQAB
-----END RSA PUBLIC KEY-----
`,
    {
      outputEncoding: 'base64',
      options: {
        environment: 'browser',
        encryptionScheme: {
          scheme: 'pkcs1_oaep',
          hash: 'sha256',
        },
      },
      // options: { environment: "browser", encryptionScheme: 'pkcs1' },
    },
  );
  console.log('pkcs1_oaep_sha256');
  console.log(pkcs1_oaep_sha256);

  decryptedWithPrivate = NODERSA.decryptRSAWithPrivateKey(
    'kSZesAAyYh2hdsQnYMdGqb6gKAzTauBKouvBzWcc4+F8RvGd0nwO6mVkUMVilPgUuNxjEauHayHiY8gI3Py45UI3+km0rSGyHrS6dHiHgCkMejXHieglYzAB0IxX3Jkm4z/66bdB/D+GFy0oct5fGCMI1UHPjEAYOsazJDa8lBFNbjiWFeb/qiZtIx3vGM7KYPAZzyRf/zPbbQ8zy9xOmRuOl5nnIxgo0Okp3KO/RIPO4GZOSBA8f2lx1UtNwwrXAMpcNavtoqHVcjJ/9lcotXYQFrn5b299pSIRf2gVm8ZJ31SK6Z8cc14nKtvgnmsgClDzIXJ1o1RcDK+knVAySg==',
    `-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`,
    {
      // PublicFormat: "pkcs1-private",
      // outEncoding: "hex"
      options: { environment: 'browser', encryptionScheme: 'pkcs1_oaep' },
    },
  );
  console.log('decryptedWithPrivate');
  console.log(decryptedWithPrivate);

  (() => {
    let key = new NODERSA.NodeRSA({ b: 1024 });
    key.setOptions({ encryptionScheme: 'pkcs1' });
    let text = `你好drpy node-ras`;
    let encrypted = key.encrypt(text, 'base64');
    console.log('encrypted: ', encrypted);
    const decrypted = key.decrypt(encrypted, 'utf8');
    console.log('decrypted: ', decrypted);
  })();
  let t2 = new Date().getTime();
  console.log('rsa_demo_test 测试耗时:' + (t2 - t1) + '毫秒');
}

rsa_demo_test();
