**The absence of electronic program listings for some channels is a normal phenomenon and is controlled by a third-party data platform.**

> The interface supports `diyp` and `xml` modes.

- diyp
  - Requires the parameters {'{'}name{'}'} (identifying the channel name to be queried) and {'{'}date{'}'} (identifying the channel date to be queried).
  - e.g. `https://epg.xxx.com/?ch={'{'}name{'}'}&date={'{'}date{'}'}`
- xml
  - This mode requires no configuration parameters
  - This mode does not support date lookups
  - e.g. `http://epg.xxx.com/e.xml`

> Priority: [Setting->Live Config->Single Source-Epg field] > [Setting->BasicConfig->Live-Epg field]
