# frozen_string_literal: true

require "test_helper"

class User::SubscriptionCreateTest < ActionDispatch::IntegrationTest

  def site
    @site ||= sites(:madrid)
  end

  def subscriptions_count
    -> { User::Subscription.count }
  end

  def honeypot_redirect_path
    "/user/subscriptions"
  end

  def test_create_subscription
    with_current_site(site) do
      visit root_path

      fill_in :user_subscription_user_email, with: "user@email.com"

      assert_difference subscriptions_count, 1 do
        click_button "Subscribe"
      end

      assert_equal gobierto_participation_root_path, current_path
    end
  end

  def test_create_spam_subscription
    with_current_site(site) do
      visit root_path

      fill_in :user_subscription_user_email, with: "spam@email.com"
      fill_in :user_subscription_ic_email, with: "spam@email.com"

      assert_no_difference subscriptions_count do
        click_button "Subscribe"
      end

      assert_equal honeypot_redirect_path, current_path
    end
  end

end