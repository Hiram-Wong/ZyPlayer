// use std::net::IpAddr;
use dns_lookup::lookup_host;
use std::process::Command;
// use serde::{Deserialize, Serialize};

// #[derive(Debug, Serialize, Deserialize)]
// enum IpType {
//   IPv4,
//   IPv6,
//   Invalid,
// }
// pub fn query_dns_ping(addresses: Vec<&str>) -> Vec<CommandResult> {
//   let mut results = Vec::new();
//   for address in addresses {
//     let ips = lookup_host(address).unwrap_or(Vec::new());
//     let mut r = CommandResult {
//       name: address.to_string(),
//       ipv4: Vec::new(),
//       ipv6: Vec::new(),
//     };
//     for ip in ips {
//       let timeout = ping(&ip.to_string());
//       let ip_result = IpResult {
//         ip: ip.to_string(),
//         timeout,
//       };
//       if ip.is_ipv4() {
//         r.ipv4.push(ip_result);
//       } else if ip.is_ipv6() {
//         r.ipv6.push(ip_result);
//       }
//     }
//     results.push(r);
//   }
//   results
// }

// #[tauri::command]
// pub fn check_ip_type(ip: &str) -> IpType {
//   match ip.parse::<IpAddr>() {
//     Ok(ip_addr) => {
//       if let IpAddr::V4(_) = ip_addr {
//         IpType::IPv4
//       } else {
//         IpType::IPv6
//       }
//     }
//     Err(_) => IpType::Invalid,
//   }
// }

#[tauri::command]
pub fn resolve_ip_address(address: &str) -> Result<Vec<String>, String> {
  match lookup_host(address) {
    Ok(ips) => {
      let ip_address: Vec<String> = ips.into_iter().map(|ip| ip.to_string()).collect();
      Ok(ip_address)
    }
    Err(e) => Err(format!("Error resolving address: {}", e)),
  }
}

#[tauri::command]
pub fn open_system_proxy() -> String {
  let output = Command::new("cmd")
    .arg("/C")
    .arg("start ms-settings:network-proxy")
    .output()
    .expect("failed");
  println!(String::from_utf8_lossy(&output.stdout).to_string());
  return String::from_utf8_lossy(&output.stdout).to_string();
}
