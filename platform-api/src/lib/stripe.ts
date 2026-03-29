import Stripe from 'stripe';
import { env } from '../utils/env.js';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY);
