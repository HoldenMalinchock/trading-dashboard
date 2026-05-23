<template>
  <div class="h-full overflow-y-auto">
    <div class="max-w-3xl mx-auto py-10 px-4">
      <UCard>
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white tracking-tight">
            About
          </h1>
          <p class="text-sm text-slate-400 mt-1">
            What this application is based on.
          </p>
        </div>

        <div class="space-y-5 text-slate-300 leading-relaxed text-[15px]">
          <p>
            This dashboard is a front-end view into the <strong class="text-white">trades</strong> project — a small automated trading bot written in Deno that runs against Alpaca's paper trading API. The dashboard reads from the same Alpaca account the bot operates on, so positions, orders, and account state shown here reflect what the bot is doing in the background.
          </p>

          <h2 class="text-xl font-semibold text-white pt-2">
            How the bot picks trades
          </h2>

          <p>
            Each run, the bot pulls the day's most active stocks by volume from Alpaca's screener and pulls one year of daily bars for each. It computes the 50-day and 200-day moving averages and uses those as the baseline signal: if the current price sits below both averages, the symbol becomes a buy candidate.
          </p>

          <p>
            On top of the moving-average signal, the bot scrapes <code>openinsider.com</code> for recent Form 4 filings — purchases and sales by officers, directors, CEOs, CFOs, and other insiders. Trades within the last six months are aggregated into average price, average delta (percent of holdings changed), and total dollar value. When insiders are buying at higher prices than the current market and the data set is meaningful (at least three filings with a non-trivial delta), that overrides the moving-average check and triggers a buy.
          </p>

          <h2 class="text-xl font-semibold text-white pt-2">
            Position sizing and guardrails
          </h2>

          <p>
            Buys are sized at 3% of current account equity, rounded up to the nearest share. The bot skips anything trading under $10 to stay out of penny-stock and pump-and-dump territory, skips symbols with fewer than 200 days of historical bars, and refuses to add to an existing position.
          </p>

          <p>
            Sell logic is simpler: open positions are sold when the current price is more than 10% above both the 50-day and 200-day moving averages. There's no stop loss yet — losing positions are held while the thesis works itself out.
          </p>

          <h2 class="text-xl font-semibold text-white pt-2">
            Why insider data
          </h2>

          <p>
            The insider-trading layer exists because of a pattern I noticed around SNOW: multiple director sales near $230 about two weeks before earnings, followed by a sharp drop. The open question the bot is meant to help answer is whether clusters of large insider sales or purchases — especially when the current price is within a few percent of the insider's transaction price — are a useful signal for short-dated options plays. For now the bot only acts on the equity side; the options exploration is still ahead.
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>
