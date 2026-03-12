# Why

I never remember when and what to buy someone on their special days

- When is X birthday?
- What do they want for Christmas?
- What are their general interests?
- What sites do they like shopping on?
- What are their clothing sizes?
- What specific items do they want... and what items do they already have?
  - What sku/color/specific item on a link do you want
- Did someone already get this thing for this person (like a registry, the
  person who is managing the list doesn't know who bought what, but everyone
  else does)
- Current address so I can send the thing to the right place
- Send me a reminder when someone's special day is coming up so I have enough
  time to order the things

It's like a glorified Christmas list but can be for any time of year

## Tech Stack

- clerk auth
- clouflare worker via nitro (so it's more agnostic)
- neon db
- drizzle


users
- id
- sizes (text)
- address (text)
- name
- birthday (date)
- anniversary (date)
- interests (text)

items
- id
- user_id
- description
- url






