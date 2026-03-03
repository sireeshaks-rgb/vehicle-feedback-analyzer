## Packages
framer-motion | Page transitions, scroll-triggered animations, and smooth staggered UI elements
recharts | Beautiful, animated sentiment pie charts
papaparse | Client-side CSV validation/parsing if needed before upload (optional, but good for UX)

## Notes
Admin authentication uses JWT stored in localStorage. Need to manually attach `Authorization: Bearer <token>` to protected endpoints (/api/upload).
